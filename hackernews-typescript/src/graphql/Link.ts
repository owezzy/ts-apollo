import { Prisma } from "@prisma/client";
import {arg, enumType, extendType, inputObjectType, intArg, list, nonNull, objectType, stringArg} from "nexus";

export const Link = objectType({
    name: "Link", // 1
    definition(t) {  // 2
        t.nonNull.int("id"); // 3
        t.nonNull.string("description"); // 4
        t.nonNull.string("url"); // 5
        t.nonNull.dateTime("createdAt");  // 1
        t.field("postedBy", {   // 1
            type: "User",
            resolve(parent, args, context) {  // 2
                return context.prisma.link
                    .findUnique({where: {id: parent.id}})
                    .postedBy();
            },
        });
        t.nonNull.list.nonNull.field("voters", {  // 1
            type: "User",
            resolve(parent, args, context) {
                return context.prisma.link
                    .findUnique({where: {id: parent.id}})
                    .voters();
            }
        })
    },
});

export const LinkQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("feed", {
            type: "Link",
            args: {
                filter: stringArg(),
                skip: intArg(),   // 1
                take: intArg(),
                orderBy: arg({ type: list(nonNull(LinkOrderByInput)) }),  // 1

            },
            resolve(parent, args, context) {
                const where = args.filter   // 2
                    ? {
                        OR: [
                            { description: { contains: args.filter } },
                            { url: { contains: args.filter } },
                        ],
                    }
                    : {};
                return context.prisma.link.findMany({
                    where,
                    skip: args?.skip as number | undefined,    // 2
                    take: args?.take as number | undefined,
                    orderBy: args?.orderBy as Prisma.Enumerable<Prisma.LinkOrderByWithRelationInput> | undefined,  // 2

                });
            },
        })
    }
});

export const LinkMutation = extendType({
    type: "Mutation",
    definition(t) {
        t.nonNull.field('post', {
            type: "Link",
            args: {
                description: nonNull(stringArg()),
                url: nonNull(stringArg())
            },

            resolve(root, args, context, info) {
                const { description, url } = args;
                const { userId } = context;

                if (!userId) {  // 1
                    throw new Error("Cannot post without logging in.");
                }

                return context.prisma.link.create({
                    data: {
                        description,
                        url,
                        postedBy: {connect: {id: userId}},  // 2
                    },
                });
            }
        })
    }
})

export const LinkOrderByInput = inputObjectType({
    name: "LinkOrderByInput",
    definition(t) {
        t.field("description", { type: Sort });
        t.field("url", { type: Sort });
        t.field("createdAt", { type: Sort });
    },
});

export const Sort = enumType({
    name: "Sort",
    members: ["asc", "desc"],
});
