use serde::{Deserialize, Serialize};
use uuid::Uuid;
use utoipa::{ToSchema};
use crate::Result;

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Eq, ToSchema)]
pub enum Role {
    Admin,
    Partner,
    Manant,
}

#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Eq)]
pub enum State {
    Active,
    Suspended,
    WaitingActivation,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct User {
    pub id: Uuid,
    pub mail: String,
    pub name: String,
    pub password: String,
    pub role: Role,
    pub created_at: u64,
}

impl User {
    pub fn new(mail: String, name: String, password: String, role: Role) -> Result<Self> {
        let id = Uuid::new_v4();
        let created_at = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)?
            .as_secs();

        Ok(Self {
            id,
            mail,
            name,
            password,
            role,
            created_at,
        })
    }
}
