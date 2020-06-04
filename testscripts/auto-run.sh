#! /bin/bash

VOTE_PROPOSAL="0x1e494494fe4506c4F745AF2411D6Dc46029e910e"
VOTE_AMOUNT="1000000000000000000000"
INVEST_AMOUNT="1000000000"

DEPOSIT_TOKEN="0xc82277e21c1569cc153e093d6462cb2262568ab9"
ISSUE_TOKEN="0xaA7e28750d8BF25B86E06172f745B4a37B2C628f"
ISSUE_AMOUNT="1000000000"

echo "-----------set_price--------------"

    NOW=`date +%s`
    EXPIRED=`expr "$NOW" + "36000"`
    
    node run.js set_price \
    --token ${DEPOSIT_TOKEN} \
    --price 3000000000000000000 \
    --expired ${EXPIRED}

    node run.js set_price \
    --token ${ISSUE_TOKEN} \
    --price 1000000000000000000 \
    --expired ${EXPIRED}

echo "-----------issue--------------"

    node run.js issue \
    --args "{ \
        \"deposit_token\":\"${DEPOSIT_TOKEN}\", \
        \"issue_token\":\"${ISSUE_TOKEN}\", \
        \"issue_amount\":\"${ISSUE_AMOUNT}\", \
        \"interest_rate\":\"219178082191781\", \
        \"duration\":\"86400\", \
        \"issue_fee\":\"5000000000000000\", \
        \"minimux_issue_ratio\":\"600000000000000000\" \
    }"

BOND_ADDRESS=`cat ./issued`

echo "BOND_ADDRESS: ${BOND_ADDRESS}"

### vote 

    echo "-----------vote--------------"
    node run.js vote \
    --bond ${BOND_ADDRESS} \
    --proposal ${VOTE_PROPOSAL} \
    --amount ${VOTE_AMOUNT}

### pra

    echo "-----------pra--------------"
    node run.js pra

### prcast

    echo "-----------prcast--------------"
    node run.js prcast \
    --bond ${BOND_ADDRESS} \
    --proposal ${VOTE_PROPOSAL} \
    --reason 0

### set_expired

    echo "-----------set_expired(vote)--------------"

    NOW=`date +%s`

    node run.js set_expired \
    --bond ${BOND_ADDRESS} \
    --what 'vote' \
    --expired ${NOW}
 
### rating

    echo "-----------rating--------------"

    node run.js rating \
    --bond ${BOND_ADDRESS}

### take

    echo "-----------take--------------"

    node run.js take \
    --bond ${BOND_ADDRESS}

### invest

    echo "-----------invest--------------"

    node run.js invest \
    --bond ${BOND_ADDRESS} \
    --amount ${INVEST_AMOUNT}

### set_expired

    echo "-----------set_expired(invest)--------------"

    NOW=`date +%s`

    node run.js set_expired \
    --bond ${BOND_ADDRESS} \
    --what 'invest' \
    --expired ${NOW}

### invest_closed
    
    echo "-----------invest_closed--------------"

    node run.js invest_closed \
    --bond ${BOND_ADDRESS}

### withdraw_crowd

    echo "-----------withdraw_crowd--------------"

    node run.js withdraw_crowd \
    --bond ${BOND_ADDRESS}

echo "-----------set_price--------------"

    NOW=`date +%s`
    EXPIRED=`expr "$NOW" + "36000"`
    
    node run.js set_price \
    --token ${DEPOSIT_TOKEN} \
    --price 2000000000000000000 \
    --expired ${EXPIRED}

echo "-----------liquidate--------------"
    
    node run.js liquidate \
    --bond ${BOND_ADDRESS} \
    --amount 100000000

echo "-----------set_price--------------"

    NOW=`date +%s`
    EXPIRED=`expr "$NOW" + "36000"`
    
    node run.js set_price \
    --token ${DEPOSIT_TOKEN} \
    --price 500000000000000000 \
    --expired ${EXPIRED}

echo "-----------liquidate--------------"
    
    node run.js liquidate \
    --bond ${BOND_ADDRESS} \
    --amount 100000000

### repay

    echo "-----------repay--------------"

    node run.js repay \
    --bond ${BOND_ADDRESS}

### profit

    echo "-----------profit(pr)--------------"

    node run.js profit \
    --bond ${BOND_ADDRESS} \
    --role pr

    echo "-----------profit(voter)--------------"

    node run.js profit \
    --bond ${BOND_ADDRESS} \
    --role voter    

### withdraw_pawn

    echo "-----------withdraw_pawn--------------"

    node run.js withdraw_pawn \
    --bond ${BOND_ADDRESS}

### invester_withdraw

    echo "-----------invester_withdraw--------------"

    node run.js invester_withdraw \
    --bond ${BOND_ADDRESS}
