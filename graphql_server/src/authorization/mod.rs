pub mod authorize_helper;
pub mod document_auth;
pub mod rubric_auth;
pub mod space_auth;
pub mod user_auth;

pub use document_auth::*;
pub use rubric_auth::*;
pub use space_auth::*;
pub use user_auth::*;

use oso::{ClassBuilder, Oso, PolarClass};

pub fn init_oso() -> Oso {
    let mut oso = Oso::new();

    let user_class_builder: ClassBuilder<UserAuth> = UserAuth::get_polar_class_builder();
    oso.register_class(
        user_class_builder
            .add_attribute_getter("role", |user| user.get_role())
            .build(),
    )
    .unwrap();

    let class_builder: ClassBuilder<SpaceAuth> = SpaceAuth::get_polar_class_builder();
    oso.register_class(class_builder.build()).unwrap();

    let document_builder: ClassBuilder<DocumentAuth> = DocumentAuth::get_polar_class_builder();
    oso.register_class(document_builder.build()).unwrap();

    let document_builder: ClassBuilder<RubricAuth> = RubricAuth::get_polar_class_builder();
    oso.register_class(document_builder.build()).unwrap();

    oso.load_files(vec!["authorization.polar"]).unwrap();

    oso
}
