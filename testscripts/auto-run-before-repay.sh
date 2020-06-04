#! /bin/bash

BOND_DATA="0xa36ff16D51656d7f4a7CeFBb3626a4d703c8b3F4";
VOTE_AMOUNT="1000000000000000000000"
INVEST_AMOUNT="1000000000"

### vote 

    echo "-----------vote--------------"
    node run.js vote \
    --bond ${BOND_DATA} \
    --proposal 0x44F24974cc08708a5ed185cB9Add6031315f362d \
    --amount ${VOTE_AMOUNT}

### pra

    echo "-----------pra--------------"
    node run.js pra

### prcast

    echo "-----------prcast--------------"
    node run.js prcast \
    --bond ${BOND_DATA} \
    --proposal 0x44F24974cc08708a5ed185cB9Add6031315f362d

### set_expired

    echo "-----------set_expired(vote)--------------"

    NOW=`date +%s`

    node run.js set_expired \
    --bond ${BOND_DATA} \
    --what 'vote' \
    --expired ${NOW}
 
### rating

    echo "-----------rating--------------"

    node run.js rating \
    --bond ${BOND_DATA}

### take

    echo "-----------take--------------"

    node run.js take \
    --bond ${BOND_DATA}

### invest

    echo "-----------invest--------------"

    node run.js invest \
    --bond ${BOND_DATA} \
    --amount ${INVEST_AMOUNT}

### set_expired

    echo "-----------set_expired(invest)--------------"

    NOW=`date +%s`

    node run.js set_expired \
    --bond ${BOND_DATA} \
    --what 'invest' \
    --expired ${NOW}

### invest_closed
    
    echo "-----------invest_closed--------------"

    node run.js invest_closed \
    --bond ${BOND_DATA}

### withdraw_crowd

    echo "-----------withdraw_crowd--------------"

    node run.js withdraw_crowd \
    --bond ${BOND_DATA}


