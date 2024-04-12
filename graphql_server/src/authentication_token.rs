use jsonwebtoken::{decode, encode, errors::Error, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};

use crate::util::get_now_as_secs;

#[derive(Debug)]
pub struct JwtToken(pub String);

impl JwtToken {
    pub fn claims(&self) -> Result<Claims, Error> {
        Claims::decode(self.0.as_ref())
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Eq, PartialEq)]
pub struct Claims {
    pub exp: usize,
    pub user_id: i32,
}

impl Claims {
    pub fn new(user_id: i32) -> Self {
        let exp = get_now_as_secs() as usize + 3600 * 24 * 365; // Expire in 1 year
        Self { exp, user_id }
    }

    pub fn new_with_ttl(user_id: i32, exp: usize) -> Self {
        Self { exp, user_id }
    }

    pub fn encode(&self) -> Result<String, Error> {
        let key = std::env::var("SECRET_KEY").unwrap();
        encode(
            &Header::default(),
            self,
            &EncodingKey::from_secret(key.as_ref()),
        )
    }

    pub fn decode(token: &str) -> Result<Self, Error> {
        let key = std::env::var("SECRET_KEY").unwrap();
        decode::<Self>(
            token,
            &DecodingKey::from_secret(key.as_ref()),
            &Validation::default(),
        )
        .map(|t| t.claims)
    }
}
