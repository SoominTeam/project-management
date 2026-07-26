import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";

// Create Inngest client
export const inngest = new Inngest({
  id: "project-management",
});

// =====================================================
// USER FUNCTIONS
// =====================================================

// Sync user creation
const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
    triggers: {
      event: "clerk/user.created",
    },
  },
  async ({ event }) => {
    const { data } = event;

    try {
      await prisma.user.create({
        data: {
          id: data.id,
          email: data.email_addresses?.[0]?.email_address,
          name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
          image: data.image_url,
        },
      });
      console.log('✅ User created:', data.id);
    } catch (error) {
      console.error('❌ Error creating user:', error.message);
      throw error;
    }
  }
);

// Sync user deletion
const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-with-clerk",
    triggers: {
      event: "clerk/user.deleted",
    },
  },
  async ({ event }) => {
    const { data } = event;

    try {
      await prisma.user.delete({
        where: {
          id: data.id,
        },
      });
      console.log('✅ User deleted:', data.id);
    } catch (error) {
      console.error('❌ Error deleting user:', error.message);
      throw error;
    }
  }
);

// Sync user update
const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
    triggers: {
      event: "clerk/user.updated",
    },
  },
  async ({ event }) => {
    const { data } = event;

    try {
      await prisma.user.update({
        where: {
          id: data.id,
        },
        data: {
          email: data.email_addresses?.[0]?.email_address,
          name: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
          image: data.image_url,
        },
      });
      console.log('✅ User updated:', data.id);
    } catch (error) {
      console.error('❌ Error updating user:', error.message);
      throw error;
    }
  }
);

// =====================================================
// WORKSPACE FUNCTIONS
// =====================================================

// Inngest function to save workspace data to a database
const syncWorkspaceCreation = inngest.createFunction(
  {
    id: 'sync-workspace-from-clerk',
    triggers: {
      event: 'clerk/organization.created',
    },
  },
  async ({ event }) => {
    const { data } = event;

    try {
      await prisma.workspace.create({
        data: {
          id: data.id,
          name: data.name,
          slug: data.slug,
          ownerId: data.created_by,
          image_url: data.image_url || "",
        },
      });

      // Add creator as ADMIN member
      await prisma.workspaceMember.create({
        data: {
          userId: data.created_by,
          workspaceId: data.id,
          role: 'ADMIN',
        },
      });

      console.log('✅ Workspace created:', data.id);
    } catch (error) {
      console.error('❌ Error creating workspace:', error.message);
      throw error;
    }
  }
);

// Inngest function to update workspace data in a database
const syncWorkspaceUpdation = inngest.createFunction(
  {
    id: 'update-workspace-from-clerk',
    triggers: {
      event: 'clerk/organization.updated',
    },
  },
  async ({ event }) => {
    const { data } = event;

    try {
      await prisma.workspace.update({
        where: {
          id: data.id,
        },
        data: {
          name: data.name,
          slug: data.slug,
          image_url: data.image_url,
        },
      });
      console.log('✅ Workspace updated:', data.id);
    } catch (error) {
      console.error('❌ Error updating workspace:', error.message);
      throw error;
    }
  }
);

// Inngest function to delete workspace data from a database
const syncWorkspaceDeletion = inngest.createFunction(
  {
    id: 'delete-workspace-with-clerk',
    triggers: {
      event: 'clerk/organization.deleted',
    },
  },
  async ({ event }) => {
    const { data } = event;

    try {
      await prisma.workspace.delete({
        where: {
          id: data.id,
        },
      });
      console.log('✅ Workspace deleted:', data.id);
    } catch (error) {
      console.error('❌ Error deleting workspace:', error.message);
      throw error;
    }
  }
);

// Inngest function to save workspace member data to a database
const syncWorkspaceMemberCreation = inngest.createFunction(
  {
    id: 'sync-workspace-member-from-clerk',
    triggers: {
      event: 'clerk/organization.membership.created',
    },
  },
  async ({ event }) => {
    const { data } = event;

    try {
      await prisma.workspaceMember.create({
        data: {
          userId: data.user_id,
          workspaceId: data.organization_id,
          role: String(data.role_name).toUpperCase(),
        },
      });
      console.log('✅ Workspace member added:', data.user_id);
    } catch (error) {
      console.error('❌ Error adding workspace member:', error.message);
      throw error;
    }
  }
);

// =====================================================
// EXPORT ALL FUNCTIONS
// =====================================================

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  syncWorkspaceCreation,
  syncWorkspaceUpdation,
  syncWorkspaceDeletion,
  syncWorkspaceMemberCreation,
];