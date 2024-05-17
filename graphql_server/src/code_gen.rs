#[macro_export]
macro_rules! impl_enum_for_db {
    ($enum_name:ident) => {
        impl diesel::deserialize::FromSql<diesel::sql_types::Integer, diesel::pg::Pg> for $enum_name
        where
            i32: diesel::deserialize::FromSql<diesel::sql_types::Integer, diesel::pg::Pg>,
        {
            fn from_sql(
                bytes: <diesel::pg::Pg as diesel::backend::Backend>::RawValue<'_>,
            ) -> diesel::deserialize::Result<Self> {
                let int_value = i32::from_sql(bytes)?;
                num_traits::FromPrimitive::from_i32(int_value)
                    .ok_or(format!("Invalid Value of Enum {}", int_value).into())
            }
        }

        impl diesel::serialize::ToSql<diesel::sql_types::Integer, diesel::pg::Pg> for $enum_name
        where
            i32: diesel::serialize::ToSql<diesel::sql_types::Integer, diesel::pg::Pg>,
        {
            fn to_sql(
                &'_ self,
                out: &mut diesel::serialize::Output<'_, '_, diesel::pg::Pg>,
            ) -> diesel::serialize::Result {
                use num_traits::ToPrimitive;
                let v = self.to_i32().unwrap_or(0);
                <i32 as diesel::serialize::ToSql<diesel::sql_types::Integer, diesel::pg::Pg>>::to_sql(
                    &v, &mut out.reborrow()
                )
            }
        }
    };
}

#[macro_export]
macro_rules! impl_jsonb_for_db {
    ($struct_name:ident) => {
        impl diesel::deserialize::FromSql<diesel::sql_types::Jsonb, diesel::pg::Pg> for $struct_name
        where
            serde_json::Value:
                diesel::deserialize::FromSql<diesel::sql_types::Jsonb, diesel::pg::Pg>,
        {
            fn from_sql(
                bytes: <diesel::pg::Pg as diesel::backend::Backend>::RawValue<'_>,
            ) -> diesel::deserialize::Result<Self> {
                let bytes = bytes.as_bytes();
                if bytes[0] != 1 {
                    return Err("Unsupported JSONB encoding version".into());
                }
                let value = serde_json::from_slice(&bytes[1..])?;
                let result = serde_json::from_value(value).unwrap_or_default();
                Ok(result)
            }
        }

        impl diesel::serialize::ToSql<diesel::sql_types::Jsonb, diesel::pg::Pg> for $struct_name
        where
            serde_json::Value: diesel::serialize::ToSql<diesel::sql_types::Jsonb, diesel::pg::Pg>,
        {
            fn to_sql(
                &self,
                out: &mut diesel::serialize::Output<'_, '_, diesel::pg::Pg>,
            ) -> diesel::serialize::Result {
                use diesel::serialize::IsNull;
                use std::io::Write;
                let value = serde_json::to_value(self)
                    .map_err(|_| format!("Cannot convert $struct_name to JSON: {:?}", self))?;
                out.write_all(&[1])?;
                serde_json::to_writer(out, &value)
                    .map(|_| IsNull::No)
                    .map_err(Into::into)
            }
        }
    };
}
