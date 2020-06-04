var issue = require("./test/issue.js");
var vote = require("./test/vote.js");
var prcast = require("./test/prcast.js");
var profit = require("./test/profit.js");
var take = require("./test/take.js");
var invest = require("./test/invest.js");
var withdraw_crowd = require("./test/withdraw_crowd.js");
var repay = require("./test/repay.js");
var withdraw_pawn = require("./test/withdraw_pawn.js");
var pra = require("./test/pra.js");
var pra_unlock = require("./test/pra_unlock.js");
var rating = require("./test/rating.js");
var invest_closed = require("./test/invest_closed.js");
var get_bond_data = require("./test/get_bond_data.js");
var invester_withdraw = require("./test/invester_withdraw.js");
var set_price = require("./test/set_price.js");
var set_expired = require("./test/set_expired.js");
var liquidate = require("./test/liquidate.js");
var enableany = require("./test/enableany.js");
var getTransactionReceipt = require("./test/getTransactionReceipt.js");
var sha3 = require("./test/sha3.js");
var sign = require("./test/sign.js");

var time = require("./utils/time.js");

var logger = require("./utils/logger.js");

require('yargs').command('issue', "issue a new bond",
    {
        builder: (yargs) => {
            yargs.option("args", {
                describe: "issue arguments",
                demandOption: true
            });
        },
        handler: async (argv) => {
            logger.info("issue/argv: ", argv);
            var args = JSON.parse(argv.args);

            var arguments = [
                args.deposit_token,
                args.issue_token,
                args.issue_amount,
                args.interest_rate,
                args.duration,
                args.issue_fee,
                args.minimux_issue_ratio,
                0,
                0,
                time.now(),
                false,
                false
            ];
            await issue(arguments);
        }
    })
    .command("vote", 'community vote', {
        builder: (yargs) => {
            yargs.option("bond", {
                describe: "bond address",
                demandOption: true
            }).option("proposal", {
                describe: "vote proposal",
                demandOption: true
            }).option("amount", {
                describe: "vote amount",
                demandOption: true
            });
        },
        handler: async (argv) => {
            logger.info("vote/argv: ", argv);
            await vote(argv.bond, argv.proposal, argv.amount);
        }
    })
    .command("pra", "professional rater authentication", {
        builder: (yargs) => yargs,
        handler: async (argv) => {
            logger.info("pra/argv: ", argv);
            await pra();
        }
    })
    .command("pra_unlock", "close professional rater authentication and withdraw", {
        builder: (yargs) => yargs,
        handler: async (argv) => {
            logger.info("pra/argv: ", argv);
            await pra_unlock();
        }
    })
    .command("prcast", "professional rater vote", {
        builder: (yargs) => {
            yargs.option("bond", {
                describe: "bond address",
                demandOption: true
            }).option("proposal", {
                describe: "vote proposal",
                demandOption: true
            }).option("reason", {
                describe: "vote reason",
                demandOption: true
            })
        },
        handler: async (argv) => {
            logger.info("prcast/argv: ", argv);
            await prcast(argv.bond, argv.proposal, argv.reason);
        }
    })
    .command("rating", "rating a bond", {
        builder: (yargs) => {
            yargs.option("bond", {
                describe: "bond address",
                demandOption: true
            });
        },
        handler: async (argv) => {
            logger.info("rating/argv: ", argv);
            await rating(argv.bond);
        }
    })
    .command("profit", "withdraw profit", {
        builder: (yargs) => {
            yargs.option("bond", {
                describe: "bond address",
                demandOption: true
            }).option("role", {
                describe: "sender role",
                choices: ['pr', 'voter'],
                demandOption: true
            });
        },
        handler: async (argv) => {
            await profit(argv.bond, argv.role);
        }
    })
    .command("take", "withdraw vote token", {
        builder: (yargs) => {
            yargs.option("bond", {
                describe: "bond address",
                demandOption: true
            });
        },
        handler: async (argv) => {
            await take(argv.bond);
        }
    })
    .command("invest", "invest bond", {
        builder: (yargs) => {
            yargs.option("bond", {
                describe: "bond address",
                demandOption: true
            }).option("amount", {
                describe: "invest amount",
                demandOption: true
            });
        },
        handler: async (argv) => {
            await invest(argv.bond, argv.amount);
        }
    })
    .command("invest_closed", "close invest", {
        builder: (yargs) => {
            yargs.option("bond", {
                describe: "bond address",
                demandOption: true
            });
        },
        handler: async (argv) => {
            await invest_closed(argv.bond);
        }
    })
    .command("withdraw_crowd", "issuer withdraw issued token", {
        builder: (yargs) => {
            yargs.option("bond", {
                describe: "bond address",
                demandOption: true
            });
        },
        handler: async (argv) => {
            await withdraw_crowd(argv.bond);
        }
    })
    .command("repay", "issuer repay", {
        builder: (yargs) => {
            yargs.option("bond", {
                describe: "bond address",
                demandOption: true
            });
        },
        handler: async (argv) => {
            await repay(argv.bond);
        }
    })
    .command("withdraw_pawn", "issuer withdraw deposited token", {
        builder: (yargs) => {
            yargs.option("bond", {
                describe: "bond address",
                demandOption: true
            });
        },
        handler: async (argv) => {
            await withdraw_pawn(argv.bond);
        }
    })
    .command("invester_withdraw", "invester withraw amount and interest when bond is finance successed", {
        builder: (yargs) => {
            yargs.option("bond", {
                describe: "bond address",
                demandOption: true
            });
        },
        handler: async (argv) => {
            await invester_withdraw(argv.bond);
        }
    })
    .command("get_bond_data", "print bond data fields", {
        builder: (yargs) => {
            yargs.option("bond", {
                describe: "bond address",
                demandOption: true
            });
        },
        handler: async (argv) => {
            await get_bond_data(argv.bond);
        }
    })
    .command("set_price", "set price to oracle", {
        builder: (yargs) => {
            yargs.option("token", {
                describe: "token address",
                demandOption: true
            }).option("price", {
                describe: "token price",
                demandOption: true
            }).option("expired", {
                describe: "expired date",
                demandOption: true
            });
        },
        handler: async (argv) => {
            logger.info("set_price/argv: ", argv);
            await set_price(argv.token || "0x0000000000000000000000000000000000000000", argv.price, argv.expired);
        }
    })
    .command("set_expired", "set expired date to bond data", {
        builder: (yargs) => {
            yargs.option("bond", {
                describe: "bond address",
                demandOption: true
            }).option("what", {
                describe: "setted what expired date",
                choices: ['vote', 'invest'],
                demandOption: true
            }).option("expired", {
                describe: "expired date",
                demandOption: true
            });
        },
        handler: async (argv) => {
            logger.info("set_expired/argv: ", argv);
            await set_expired(argv.bond, argv.what, argv.expired);
        }
    })
    .command("enableany", "enableany auth for account", {
        builder: (yargs) => {
            yargs.option("who", {
                describe: "approve for who?",
                demandOption: true
            }).option("to", {
                describe: "target contract",
                demandOption: true
            });
        },
        handler: async (argv) => {
            logger.info("enableany/argv: ", argv);
            await enableany(argv.who, argv.to);
        }
    })
    .command("liquidate", "liquidate bond", {
        builder: (yargs) => {
            yargs.option("bond", {
                describe: "bond address",
                demandOption: true
            }).option("amount", {
                describe: "liqudiate amount",
                demandOption: true
            });
        },
        handler: async (argv) => {
            logger.info("liquidate/argv: ", argv);
            await liquidate(argv.bond, argv.amount);
        }
    })
    .command("getTransactionReceipt", "web3.eth.getTransactionReceipt", {
        builder: (yargs) => {
            yargs.option("hash", {
                describe: "transaction hash",
                demandOption: true
            });
        },
        handler: async (argv) => {
            logger.info("getTransactionReceipt/argv: ", argv);
            await getTransactionReceipt(argv.hash);
        }
    })
    .command("sha3", "web3.utils.sha3", {
        builder: (yargs) => {
            yargs.option("types", {
                describe: "hash data types",
                demandOption: true
            }).option("values", {
                describe: "hash data values",
                demandOption: true
            });
        },
        handler: async (argv) => {
            logger.info("sha3/argv: ", argv);
            
            let _types = JSON.parse(argv.types);
            let _values = JSON.parse(argv.values);

            if(typeof _types == "array" && typeof _values == "array") {
                throw new Error("types and values MUST be an array");
            }

            await sha3(_types, _values);
        }
    })
    .command("sign", "web3.eth.accounts.sign", {
        builder: (yargs) => {
            yargs.option("types", {
                describe: "sign data types",
                demandOption: true
            }).option("values", {
                describe: "sign data values",
                demandOption: true
            });
        },
        handler: async (argv) => {
            logger.info("sign/argv: ", argv);

            let _types = JSON.parse(argv.types);
            let _values = JSON.parse(argv.values);

            if(typeof _types == "array" && typeof _values == "array") {
                throw new Error("types and values MUST be an array");
            }
            await sign(_types, _values);
        }
    })
    .demandCommand(1)
    .help(false)
    .version(false)
    .parse();
