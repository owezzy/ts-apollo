import {extendType, nonNull, objectType, stringArg} from "nexus";

export const Link = objectType({
    name: "Link", // 1
    definition(t) {  // 2
        t.nonNull.int("id"); // 3
        t.nonNull.string("description"); // 4
        t.nonNull.string("url"); // 5
        t.field("postedBy", {   // 1
            type: "User",
            resolve(parent, args, context) {  // 2
                return context.prisma.link
                    .findUnique({ where: { id: parent.id } })
                    .postedBy();
            },
        });
    },
});

export const LinkQuery = extendType({
    type: "Query",
    definition(t) {
        t.nonNull.list.nonNull.field("feed", {
            type: "Link",
            resolve(root, args, context, info) {
                return context.prisma.link.findMany();  // 1
            }
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

