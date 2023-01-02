"use strict";

const DbService = require("db-mixin");
const ConfigLoader = require("config-mixin");
const Membership = require("membership-mixin");


/**
 * attachments of addons service
 */
module.exports = {
	name: "repos",
	version: 1,

	mixins: [
		DbService({}),
		ConfigLoader(['repos.**']),
		Membership({
			permissions: 'repos'
		})
	],

	/**
	 * Service dependencies
	 */
	dependencies: [
		
	],

	/**
	 * Service settings
	 */
	settings: {
		rest: "/v1/repos",

		fields: {
			id: {
				type: "string",
				primaryKey: true,
				secure: true,
				columnName: "_id"
			},

			name: {
				type: "string",
				required: true,
				immutable: true,
				lowercase: true,
				trim: true,
				empty: false,
			},
			url: {
				type: "string",
				set({ ctx }) {
					return `https://${this.config["repos.git.url"]}/${ctx.params.name}.git`
				}
			},
			commits: {
				type: "array",
				items: { type: "string", empty: false },
				readonly: true,
				populate: {
					action: "v1.repos.commits.list",
					params: {
						//fields: ["id", "name"]
					}
				}
			},


			stats: {
				type: "string",
				readonly: true,
				populate: {
					action: "v1.repos.stats.resolve",
					params: {
						//fields: ["id", "name"]
					}
				}
			},

			...Membership.FIELDS,

			options: { type: "object" },
			createdAt: {
                type: "number",
                readonly: true,
                onCreate: () => Date.now()
            },
            updatedAt: {
                type: "number",
                readonly: true,
                onUpdate: () => Date.now()
            },
            deletedAt: {
                type: "number",
                readonly: true,
                hidden: "byDefault",
                onRemove: () => Date.now()
            }
		},

		scopes: {
			notDeleted: { deletedAt: null },

			...Membership.SCOPE,
		},

		defaultScopes: [ "notDeleted", ...Membership.DSCOPE],

		sidebands: {}
	},


	crons: [
		{
			name: "ClearExpiredRecords",
			cronTime: "* * * * *",
			onTick: {
				//action: "v1.dohs.clearExpired"
			}
		}
	],
	/**
	 * Actions
	 */


	actions: {
		create: {
			permissions: ['repos.create'],
		},
		list: {
			permissions: ['repos.list'],
			params: {
				//domain: { type: "string" }
			}
		},

		find: {
			rest: "GET /find",
			permissions: ['repos.find'],
			params: {
				//domain: { type: "string" }
			}
		},

		count: {
			rest: "GET /count",
			permissions: ['repos.count'],
			params: {
				//domain: { type: "string" }
			}
		},

		get: {
			needEntity: true,
			permissions: ['repos.get'],
		},

		update: {
			needEntity: true,
			permissions: ['repos.update'],
		},

		replace: false,

		remove: {
			needEntity: true,
			permissions: ['repos.remove'],

		},



		getRepo: {
			description: "Add members to the addon",
			params: {
				owner: { type: "string", optional: true },
				member: { type: "string", optional: true },
				name: { type: "string", optional: true },
				id: { type: "string", optional: true }
			},
			async handler(ctx) {
				const params = Object.assign({}, ctx.params);

				const query = { deletedAt: null }

				if (params.name) {
					query.name = params.name
				}

				if (params.id) {
					query.id = this.decodeID(params.id)
				}

				if (params.member) {
					query.members = params.member
				} else if (params.owner) {
					query.owner = params.owner
				}
				return this.findEntity(ctx, {
					query: query,
					scope: false
				});
			}
		},
	},

	/**
	 * Events
	 */
	events: {

	},

	/**
	 * Methods
	 */

	methods: {

	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {

	},

	/**
	 * Service started lifecycle event handler
	 */
	async started() {

	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {

	}
};