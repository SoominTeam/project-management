import { Inngest } from "inngest";
import { prisma } from "../configs/prisma.js"; // import the prisma client

// Create a client to send and receive events from Inngest
export const inngest = new Inngest({ id: "project-management" });

// Inngest Functons are to save user data to the database 
const syncUserCreation = inngest.createFunction(
    {id: 'sync-user-from-clerk'},
    {event: 'clerk/user.created'},
    async({event}) => {
        const { data } = event;
        await prisma.user.create({
            data: {
                id: data.id,
                email: data?.email_addresses[0]?.email_address,
                name: data?.first_name + " " + data?.last_name,
                image: data?.image_url,

            }
        })
    }
)


// Inngest Functions to delete user data from the database when a user is deleted from Clerk
const syncUserDeletion = inngest.createFunction(
    {id: 'delete-user-with-clerk'},
    {event: 'clerk/user.deleted'},
    async({event}) => {
        const { data } = event;
        await prisma.user.delete({
            where: {
                id: data.id
            }
        })
    }
)

// Inngest Functions to update user data in the database when a user is updated in Clerk
const syncUserUpdation = inngest.createFunction(
    {id: 'update-user-from-clerk'},
    {event: 'clerk/user.updated'},
    async({event}) => {
        const { data } = event;
        await prisma.user.update({
            where: {
                id: data.id
            },
            data: {
                email: data?.email_addresses[0]?.email_address,
                name: data?.first_name + " " + data?.last_name,
                image: data?.image_url
            }
        })
    }
)

// Create an empty array where we'll export future Inngest functions. This is required for Inngest to find your functions when you deploy.
export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];