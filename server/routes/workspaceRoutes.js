import express from 'express';
import { getUserWorkspaces , addMemberToWorkspace } from '../controller/workspaceController.js';

const workspaceRouter = express.Router();

workspaceRouter.get('/', getUserWorkspaces);
workspaceRouter.post('/add-member', addMemberToWorkspace);

export default workspaceRouter;