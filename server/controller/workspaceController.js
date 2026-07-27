import prisma from '../configs/prisma.js';

// Get all workspaces for a user
export const getUserWorkspaces = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const workspaces = await prisma.workspace.findMany({
            where: {
                members: {
                    some: {
                        userId: userId
                    }
                }
            },
            include: {
                members: {
                    include: {
                        user: true
                    }
                },
                projects: {
                    include: {
                        tasks: {
                            include: {
                                assignee: true,
                                comments: {
                                    include: {
                                        user: true
                                    }
                                }
                            }
                        },
                        members: {
                            include: {
                                user: true
                            }
                        }
                    }
                },
                owner: true
            }
        });

        res.json({ workspaces });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.code || error.message });
    }
}

// Add member to workspace
export const addMemberToWorkspace = async (req, res) => {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const { email, role, workspaceId, message } = req.body;

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!workspaceId || !role) {
            return res.status(400).json({ error: 'workspaceId and role are required' });
        }

        if (!['ADMIN', 'MEMBER'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        // fetch workspace
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            include: {
                members: true
            }
        });

        if (!workspace) {
            return res.status(404).json({ error: 'Workspace not found' });
        }

        // Check creator has ADMIN role
        if (!workspace.members.some((member) => member.userId === userId && member.role === 'ADMIN')) {
            return res.status(403).json({ error: 'Only workspace admins can add members' });
        }

        // Check if user is already a member
        const existingMember = workspace.members.find((member) => member.userId === user.id);
        if (existingMember) {
            return res.status(400).json({ error: 'User is already a member of this workspace' });
        }

        const member = await prisma.workspaceMember.create({
            data: {
                userId: user.id,
                workspaceId: workspace.id,
                role: role,
                message: message || null
            }
        });

        res.json({ member, message: 'Member added successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.code || error.message });
    }
}