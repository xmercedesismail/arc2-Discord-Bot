const Discord = require('discord.js');

const Schema = require("../../database/models/family");

module.exports = async (client, interaction, args) => {

    const target = interaction.options.getUser('user');
    const author = interaction.user;

    if (author.id == target.id) return client.errNormal({
        error: "You cannot disown yourself",
        type: 'editreply'
    }, interaction);

    if (target.bot) return client.errNormal({
        error: "You cannot disown a bot",
        type: 'editreply'
    }, interaction);

    const data = await Schema.findOne({ Guild: interaction.guild.id, Parent: target.id });
    if (data) {
        const data2 = await Schema.findOne({ Guild: interaction.guild.id, User: data.Parent });
        if (data2) {
            client.embed({ title: `👪・Disowned`, desc: `${author} has disowned <@!${data.Parent}>`, type: 'editreply' }, interaction);

            data.Parent = null;
            await data.save();
        }
    }
    else {
        const userData = await Schema.findOne({ Guild: interaction.guild.id, User: author.id });
        if (userData) {
            if (userData.Children.includes(target.username)) {
                const filtered = userData.Children.filter((user) => user !== target.username);

                await Schema.findOneAndUpdate(
                    { Guild: interaction.guild.id, User: author.id },
                    {
                        Guild: interaction.guild.id,
                        User: author.id,
                        Children: filtered
                    }
                );

                const parentData = await Schema.findOne({ Guild: interaction.guild.id, Parent: author.id });
                if (parentData) {
                    parentData.Parent = null;
                    await parentData.save();
                }

                client.embed({ title: `👪・Disowned`, desc: `${author} has disowned <@!${target.id}>`, type: 'editreply' }, interaction);
            }
            else {
                client.errNormal({ error: "You have no children/parents at the moment", type: 'editreply' }, interaction);
            }
        }
        else {
            client.errNormal({ error: "You have no children/parents at the moment", type: 'editreply' }, interaction);
        }
    }
}

 