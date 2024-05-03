actor UserAuth {}

allow(user: UserAuth, action, space: SpaceAuth) if
    has_permission(user, action, space);

resource SpaceAuth {
    roles = ["Student", "Teacher", "Creator"];
    permissions = [
		"view_space_content",
		"manage_space_content",
		"manage_space_member",
		"manage_space_setting",
    ];

	"view_space_content" if "Student";

	"Student" if "Teacher";
	"manage_space_content" if "Teacher";

	"Teacher" if "Creator";
	"manage_space_member" if "Teacher";
	"manage_space_setting" if "Teacher";
}

has_role(user: UserAuth, "Creator", space: SpaceAuth) if
    space.id = user.space_id and
    user.role = "Teacher" and
    space.creator_id = user.id;

has_role(user: UserAuth, "Teacher", space: SpaceAuth) if
    space.id = user.space_id and
    user.role = "Teacher";

has_role(user: UserAuth, role: String, space: SpaceAuth) if
    space.id = user.space_id and
    user.role = role;

# DOCUMENT AUTH SPACE
allow(actor: UserAuth, action, doc: DocumentAuth) if
    has_permission(actor, action, doc);

allow(actor: UserAuth, "view_answer", doc: DocumentAuth) if
    (doc.allow_for_student_view_answer and doc.creator_id = actor.id) or
    has_permission(actor, "view_answer", doc);

allow(actor: UserAuth, "interactive_with_tool", doc: DocumentAuth) if
	doc.is_doing_submission and
	doc.creator_id = actor.id and
	actor.role = "Student";

allow(actor: UserAuth, "interactive_with_tool", doc: DocumentAuth) if
	not doc.is_doing_submission and
	actor.org_role = "Teacher";

allow(actor: UserAuth, "edit_document", doc: DocumentAuth) if
	(doc.is_doing_open_type_submission and doc.space_id = actor.space_id and doc.creator_id = actor.id) and
    has_permission(actor, "edit_document", doc);

resource DocumentAuth {
    roles = ["Reader", "Writer"];
    permissions = [
        "view_document",
        "interactive_with_tool",
        "view_answer",
        "edit_document",
        "manage_document",
    ];

    "view_document" if "Reader";

    "Reader" if "Writer";
    "view_answer" if "Writer";
    "edit_document" if "Writer";
    "manage_document" if "Writer";
}

has_role(user: UserAuth, "Writer", doc: DocumentAuth) if
    user.space_id = doc.space_id and user.id = doc.creator_id;

has_role(user: UserAuth, "Writer", doc: DocumentAuth) if
    user.space_id = doc.space_id and
    user.role = "Teacher";

has_role(user: UserAuth, "Reader", doc: DocumentAuth) if
    doc.space_id = user.space_id;

has_role(_: UserAuth, "Reader", doc: DocumentAuth) if
    doc.is_public;
