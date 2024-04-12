import { gql } from "@apollo/client";

export const GET_CLASS_LESSONS = gql`
  query GetDocuments($classId: Int!) {
    classGet(classId: $classId) {
      id
      classDocuments {
        classId
        documentId
        document {
          id
          title
          createdAt
          parentId
          index
          documentType
          hideRule
          deletedAt
          assignment {
            id
          }
          submission {
            id
          }
        }
      }
    }
  }
`;

export const GET_CLASS_BY_ID = gql`
  query GetClassById($classId: Int!) {
    classGet(classId: $classId) {
      id
      name
      updatedAt
      createdAt
      bannerId
      banner {
        uuid
        publicUrl
        fileName
      }
      creator {
        id
        firstName
        lastName
        randomColor
        avatar {
          publicUrl
        }
        orgPersonalInformation {
          fullName
          avatar {
            publicUrl
          }
        }
      }
      members {
        userId
        classId
        user {
          id
          firstName
          lastName
          avatar {
            publicUrl
          }
          randomColor
          orgMember {
            orgRole
          }
          email
          orgPersonalInformation {
            fullName
            avatar {
              publicUrl
            }
          }
        }
        createdAt
      }
    }
  }
`;

export const GET_CLASS_MEMBERS = gql`
  query GetClassMembers($classId: Int!) {
    classGet(classId: $classId) {
      id
      members {
        userId
        classId
        createdAt
        user {
          id
          firstName
          lastName
          email
          randomColor
          orgMember {
            orgRole
          }
          orgPersonalInformation {
            fullName
            avatar {
              publicUrl
            }
          }
          avatar {
            publicUrl
          }
        }
      }
    }
  }
`;

export const GET_BASIC_CLASS_DETAIL = gql`
  query GetBasicClassDetail($classId: Int!) {
    classGet(classId: $classId) {
      id
      name
      banner {
        publicUrl
      }
    }
  }
`;

export const GET_MY_CLASSES = gql`
  query GetMyClasses {
    classGetMyClasses {
      id
      name
      deletedAt
      banner {
        publicUrl
      }
      starterDocument {
        documentId
      }
    }
  }
`;

export const GET_DELETED_CLASSES = gql`
  query GetDeletedClasses {
    classGetDeletedClasses {
      id
      name
      deletedAt
      banner {
        publicUrl
      }
    }
  }
`;

export const GET_ORG_CLASSES = gql`
  query GetOrgClasses {
    classGetAllOrgClasses {
      id
      name
    }
  }
`;
