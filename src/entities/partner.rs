use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "partner")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    #[sea_orm(ignore)]
    pub coordinate: Option<String>,
    #[sea_orm(unique, nullable)]
    pub siren: Option<i32>,
    pub social_obj: Option<String>,
    pub highlight: Option<bool>,
    pub highlight_text: Option<String>,
    pub verification: Option<bool>,
    pub category: Option<String>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "crate::entities::user::Entity",
        from = "Column::Id",
        to = "crate::entities::user::Column::Id"
    )]
    User,
    #[sea_orm(has_many = "crate::entities::transaction::Entity")]
    Transaction,
}

impl Related<crate::entities::user::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::User.def()
    }
}

impl Related<crate::entities::transaction::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Transaction.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
