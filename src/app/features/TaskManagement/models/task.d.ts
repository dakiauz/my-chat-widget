// models/task.ts

import { ILead } from '../../LeadManagement/Leads/models/lead';

export interface ITask {
    id: number;
    user_id: number;
    leads: ILead[];
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate: string;
}
export type SubmitTaskFormDataType = Omit<ITaskFormData, 'id'>;

export interface ITaskFormData {
    id: number;
    leads: number[];
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate: string;
}
export interface ICreateTaskPayload {
    leads: number[];
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate: string;
}

export interface IUpdateTaskPayload {
    leads: number[];
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate: string;
}

export interface IGetTasksResponse {
    success: boolean;
    message: string;
    data: {
        tasks: ITask[];
    };
}

export interface IDeleteTaskResponse {
    message: string;
}
