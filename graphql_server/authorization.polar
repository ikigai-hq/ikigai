actor UserAuth {}

allow(user: UserAuth, action, space: SpaceAuth) if
    has_permission(user, action, space);

resource SpaceAuth {
    roles = ["student", "teacher", "creator"];
    permissions = [
		"view_space_content",
		"manage_space_content",
		"manage_space_member",
		"manage_space_setting",
    ];

	"view_space_content" if "student";

	"student" if "teacher";
	"manage_space_content" if "teacher";

	"teacher" if "creator";
	"manage_space_member" if "creator";
	"manage_space_setting" if "creator";
}

has_role(user: UserAuth, "creator", space: SpaceAuth) if
    space.id = user.space_id and
    user.role = "teacher" and
    space.creator_id = user.id;

has_role(user: UserAuth, "teacher", space: SpaceAuth) if
    space.id = user.space_id and
    user.role = "teacher";

has_role(user: UserAuth, role: String, space: SpaceAuth) if
    space.id = user.space_id and
    user.role = role;

# DOCUMENT AUTH SPACE
allow(actor: UserAuth, action, doc: DocumentAuth) if
    has_permission(actor, action, doc);

allow(actor: UserAuth, "view_answer", doc: DocumentAuth) if
    doc.allow_for_student_view_answer and doc.creator_id = actor.id;

allow(actor: UserAuth, "interactive_with_tool", doc: DocumentAuth) if
	doc.is_doing_submission and
	doc.creator_id = actor.id;

allow(actor: UserAuth, "view_page_content", doc: DocumentAuth) if
	doc.is_submission and
	doc.creator_id = actor.id;

resource DocumentAuth {
    roles = ["reader", "writer"];
    permissions = [
        "view_document",
        "view_page_content",
        "interactive_with_tool",
        "view_answer",
        "edit_document",
        "manage_document",
    ];

    "view_document" if "reader";

    "reader" if "writer";
    "view_page_content" if "writer";
    "edit_document" if "writer";
    "interactive_with_tool" if "writer";
    "view_answer" if "writer";
    "manage_document" if "writer";
}

has_role(user: UserAuth, "reader", doc: DocumentAuth) if
    doc.space_id = user.space_id
    and doc.visibility = "public"
    and not doc.is_delete;

has_role(user: UserAuth, "reader", doc: DocumentAuth) if
    doc.space_id = user.space_id
     and doc.visibility = "assignees"
     and user.id in doc.assignees
     and not doc.is_delete;

has_role(user: UserAuth, "reader", doc: DocumentAuth) if
    doc.space_id = user.space_id
     and doc.is_submission
     and doc.creator_id = user.id
     and not doc.is_delete;

has_role(user: UserAuth, "reader", doc: DocumentAuth) if
    user.space_id = doc.space_id and
    user.role = "teacher"
    and doc.is_delete;

has_role(user: UserAuth, "writer", doc: DocumentAuth) if
    user.space_id = doc.space_id and
    user.role = "teacher"
    and not doc.is_delete;


# RUBRIC AUTH SPACE
allow(actor: UserAuth, action, doc: RubricAuth) if
    has_permission(actor, action, doc);

resource RubricAuth {
    roles = ["creator"];
    permissions = [
        "manage_rubric",
    ];

    "manage_rubric" if "creator";
}

has_role(user: UserAuth, "creator", rubric: RubricAuth) if
	user.id = rubric.user_id;
