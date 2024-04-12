#[macro_export]
macro_rules! impl_enum_for_db {
    ($enum_name:ident) => {
        impl<DB> diesel::types::FromSql<diesel::sql_types::Integer, DB> for $enum_name
        where
            DB: diesel::backend::Backend,
            i32: diesel::types::FromSql<diesel::sql_types::Integer, DB>,
        {
            fn from_sql(bytes: Option<&DB::RawValue>) -> diesel::deserialize::Result<Self> {
                let int_value = i32::from_sql(bytes)?;
                num_traits::FromPrimitive::from_i32(int_value)
                    .ok_or(format!("Invalid Value of Enum {}", int_value).into())
            }
        }

        impl<DB> diesel::types::ToSql<diesel::sql_types::Integer, DB> for $enum_name
        where
            DB: diesel::backend::Backend,
            i32: diesel::types::ToSql<diesel::sql_types::Integer, DB>,
        {
            fn to_sql<W: std::io::Write>(
                &self,
                out: &mut diesel::serialize::Output<W, DB>,
            ) -> diesel::serialize::Result {
                use num_traits::ToPrimitive;
                self.to_i32().unwrap_or(0).to_sql(out)
            }
        }
    };
}

#[macro_export]
macro_rules! impl_jsonb_for_db {
    ($struct_name:ident) => {
        impl<DB> diesel::deserialize::FromSql<diesel::sql_types::Jsonb, DB> for $struct_name
        where
            DB: diesel::backend::Backend,
            serde_json::Value: diesel::deserialize::FromSql<diesel::sql_types::Jsonb, DB>,
        {
            fn from_sql(bytes: Option<&DB::RawValue>) -> diesel::deserialize::Result<Self> {
                let value = serde_json::Value::from_sql(bytes)?;
                let result = serde_json::from_value::<$struct_name>(value).unwrap_or_default();
                Ok(result)
            }
        }

        impl<DB> diesel::serialize::ToSql<diesel::sql_types::Jsonb, DB> for $struct_name
        where
            DB: diesel::backend::Backend,
            serde_json::Value: diesel::serialize::ToSql<diesel::sql_types::Jsonb, DB>,
        {
            fn to_sql<W: std::io::Write>(
                &self,
                out: &mut diesel::serialize::Output<W, DB>,
            ) -> diesel::serialize::Result {
                let value = serde_json::to_value(self)
                    .map_err(|_| format!("Cannot convert $struct_name to JSON: {:?}", self))?;
                value.to_sql(out)
            }
        }
    };
}
