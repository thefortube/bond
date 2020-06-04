
# rinkeby测试网测试命令示例

### issue
    node run.js issue \
    --args '{"deposit_token":"0xc82277e21c1569cc153e093d6462cb2262568ab9","issue_token":"0xaA7e28750d8BF25B86E06172f745B4a37B2C628f","issue_amount":"1000000000","interest_rate":"219178082191781","duration":"86400","issue_fee":"2000000000000000","minimux_issue_ratio":"600000000000000000"}'

### vote 

    node run.js vote \
    --bond 0x8FDB2627fDceFBf7B11B7F1cadb9E642BBf0f6A7 \
    --proposal 0x44F24974cc08708a5ed185cB9Add6031315f362d \
    --amount 1000000000000000000000

### pra
    
    node run.js pra

### prcast

    node run.js prcast \
    --bond 0x8FDB2627fDceFBf7B11B7F1cadb9E642BBf0f6A7 \
    --proposal 0x44F24974cc08708a5ed185cB9Add6031315f362d
    --reason 0

### rating

    node run.js rating \
    --bond 0x8FDB2627fDceFBf7B11B7F1cadb9E642BBf0f6A7

### take

    node run.js take \
    --bond 0x8FDB2627fDceFBf7B11B7F1cadb9E642BBf0f6A7

### invest

    node run.js invest \
    --bond 0x8FDB2627fDceFBf7B11B7F1cadb9E642BBf0f6A7 \
    --amount 1000000000

### invest_closed
    
    node run.js invest_closed \
    --bond 0x8FDB2627fDceFBf7B11B7F1cadb9E642BBf0f6A7

### withdraw_crowd

    node run.js withdraw_crowd \
    --bond 0x8FDB2627fDceFBf7B11B7F1cadb9E642BBf0f6A7

### repay

    node run.js repay \
    --bond 0x8FDB2627fDceFBf7B11B7F1cadb9E642BBf0f6A7

### profit
    
    node run.js profit \
    --bond 0x8FDB2627fDceFBf7B11B7F1cadb9E642BBf0f6A7 \
    --role pr

    node run.js profit \
    --bond 0x8FDB2627fDceFBf7B11B7F1cadb9E642BBf0f6A7 \
    --role voter    

### withdraw_pawn

    node run.js withdraw_pawn \
    --bond 0x8FDB2627fDceFBf7B11B7F1cadb9E642BBf0f6A7

### invester_withdraw

    node run.js invester_withdraw \
    --bond 0x8FDB2627fDceFBf7B11B7F1cadb9E642BBf0f6A7

### enableany

    为指定的用户授权. 

    node run.js enableany \
    --who 0xfD1412eE517b9eD95E42568603178C4d4CB83E68 \
    --to 0xdcA6b396D4f82c439b90c0a824468BEF70C04e4A

### set_price

    node run.js set_price \
    --token 0xc82277e21c1569cc153e093d6462cb2262568ab9 \
    --price 3000000000000000000 \
    --expired 1586958321

### set_expired

    node run.js set_expired \
    --bond 0x8FDB2627fDceFBf7B11B7F1cadb9E642BBf0f6A7 \
    --what 'vote' \
    --expired 1586958321 

### liquidate

    node run.js liquidate --bond 0x8FDB2627fDceFBf7B11B7F1cadb9E642BBf0f6A7 --amount 1000000000



### sign 
    
    node run.js sign --types '["address", "address", "uint256"]' --values '["0xEEaEa1397B40e20fe7D3FdEF318FCB4916Beab04", "0x573f2001741544163a35a35c67fff3508d88f538", "0"]'


### sha3

    node run.js sha3 --types '["address", "address", "uint256"]' --values '["0xEEaEa1397B40e20fe7D3FdEF318FCB4916Beab04", "0x573f2001741544163a35a35c67fff3508d88f538", "0"]'
