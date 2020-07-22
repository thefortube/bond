pragma experimental ABIEncoderV2;
pragma solidity ^0.6.0;

import "./ERC20lib.sol";
import "./ReentrancyGuard.sol";
import "./StageDefine.sol";

interface ICore {
    function initialDepositCb(uint256 id, uint256 amount) external;
    function depositCb(address who, uint256 id, uint256 amount) external returns (bool);

    function investCb(address who, uint256 id, uint256 amount) external returns (bool);

    function interestBearingPeriod(uint256 id) external returns (bool);

    function txOutCrowdCb(address who, uint256 id) external returns (uint);

    function repayCb(address who, uint256 id) external returns (uint);

    function withdrawPawnCb(address who, uint256 id) external returns (uint);

    function withdrawPrincipalCb(address who, uint id) external returns (uint);
    function withdrawPrincipalAndInterestCb(address who, uint id) external returns (uint);
    function liquidateCb(address who, uint id, uint liquidateAmount) external returns (uint, uint, uint, uint);
    function overdueCb(uint256 id) external;

    function withdrawSysProfitCb(address who, uint256 id) external returns (uint256);
    
    
    function MonitorEventCallback(address who, address bond, bytes32 funcName, bytes calldata) external;
}


/**
 * @title ERC20 interface
 * @dev see https://eips.ethereum.org/EIPS/eip-20
 */
interface IERC20Detailed {
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
}

interface IVote {
    function take(uint256 id, address who) external returns(uint256);
    function cast(uint256 id, address who, address proposal, uint256 amount) external;
    function profit(uint256 id, address who) external returns(uint256);
}


interface IACL {
    function accessible(address sender, address to, bytes4 sig)
        external
        view
        returns (bool);
    function enableany(address from, address to) external;
    function enableboth(address from, address to) external;
}


contract BondData is ERC20Detailed, ERC20Burnable, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    address public logic;

    constructor(
        address _ACL,
        uint256 bondId,
        string memory _bondName,
        address _issuer,
        address _collateralToken,
        address _crowdToken,
        uint256[8] memory info,
        bool[2] memory _redeemPutback //是否支持赎回和回售
    ) public ERC20Detailed(_bondName, _bondName, 0) {
        ACL = _ACL;
        id = bondId;
        issuer = _issuer;
        collateralToken = _collateralToken;
        crowdToken = _crowdToken;
        totalBondIssuance = info[0];
        couponRate = info[1];
        maturity = info[2];
        issueFee = info[3];
        minIssueRatio = info[4];
        financePurposeHash = info[5];
        paymentSourceHash = info[6];
        issueTimestamp = info[7];
        supportRedeem = _redeemPutback[0];
        supportPutback = _redeemPutback[1];
        par = 100;
    }

    /** ACL */
    address public ACL;

    modifier auth {
        IACL _ACL = IACL(ACL);
        require(
            _ACL.accessible(msg.sender, address(this), msg.sig)
        , "access unauthorized");
        _;
    }

    /** 债券基本信息 */

    uint256 public id;
    address public issuer; //发债方
    address public collateralToken; //质押代币
    address public crowdToken; //融资代币地址

    uint256 public totalBondIssuance; //预计发行量，债券发行总量，以USDT计
    uint256 public actualBondIssuance; //实际发行份数
    uint256 public mintCnt;//增发的次数
    uint256 public par; //票面价值（面值）,USDT or DAI
    uint256 public couponRate; //票面利率；息票利率 15%

    uint256 public maturity; //债券期限，到期日,债券期限(30天)
    uint256 public issueFee; //发行费用,0.2%
    uint256 public minIssueRatio; //最低融资比率

    uint256 public financePurposeHash;
    uint256 public paymentSourceHash;
    uint256 public issueTimestamp;//申请发债时间
    bool public supportRedeem;//是否支持赎回, 该变量之前没有使用，现作为是否支持评级的标志, 支持为true，否则为false
    bool public supportPutback;//是否支持回售

    //分批清算的参数设置，设置最后剩余清算额度为1000单位，当最后剩余清算额度<1000时，用户需一次性清算完毕。
    uint256 public partialLiquidateAmount;

    uint256 public discount; //清算折扣,系统设定，非发行方提交
    uint256 public liquidateLine = 7e17;//质押资产价值下跌30%时进行清算 1-0.3 = 0.7
    uint256 public gracePeriod = 1 days; //债务宽限期
    uint256 public depositMultiple;

    /** 债券状态时间线 */

    uint256 public voteExpired; //债券投票截止时间
    uint256 public investExpired; //用户购买债券截止时间
    uint256 public bondExpired; //债券到期日

    /** 债券创建者/投资者信息 */

    struct Balance {
        //发行者：
        //amountGive: 质押的token数量，项目方代币
        //amountGet: 募集的token数量，USDT，USDC

        //投资者：
        //amountGive: 投资的token数量，USDT，USDC
        //amountGet: 债券凭证数量
        uint256 amountGive;
        uint256 amountGet;
    }

    //1个发行人
    uint256 public issuerBalanceGive;
    //多个投资人
    mapping(address => Balance) public supplyMap; //usr->supply

    /** 债券配置对象 */

    uint256 public fee;
    uint256 public sysProfit;//平台盈利，为手续费的分成

    //债务加利息
    uint256 public liability;
    uint256 public originLiability;

    //状态：
    uint256 public bondStage;
    uint256 public issuerStage;

    function setLogics(address _logic, address _voteLogic) external auth {
        logic = _logic;
        voteLogic = _voteLogic;
    }

    function setBondParam(bytes32 k, uint256 v) external auth {
        if (k == bytes32("discount")) {
            discount = v;
            return;
        }

        if (k == bytes32("liquidateLine")) {
            liquidateLine = v;
            return;
        }

        if (k == bytes32("depositMultiple")) {
            depositMultiple = v;
            return;
        }

        if (k == bytes32("gracePeriod")) {
            gracePeriod = v;
            return;
        }

        if (k == bytes32("voteExpired")) {
            voteExpired = v;
            return;
        }

        if (k == bytes32("investExpired")) {
            investExpired = v;
            return;
        }

        if (k == bytes32("bondExpired")) {
            bondExpired = v;
            return;
        }

        if (k == bytes32("partialLiquidateAmount")) {
            partialLiquidateAmount = v;
            return;
        }
        
        if (k == bytes32("fee")) {
            fee = v;
            return;
        }
        
        if (k == bytes32("sysProfit")) {
            sysProfit = v;
            return;
        }
        
        if (k == bytes32("originLiability")) {
            originLiability = v;
            return;
        }

        if (k == bytes32("liability")) {
            liability = v;
            return;
        }

        if (k == bytes32("totalWeights")) {
            totalWeights = v;
            return;
        }

        if (k == bytes32("totalProfits")) {
            totalProfits = v;
            return;
        }

        if (k == bytes32("borrowAmountGive")) {
            issuerBalanceGive = v;
            return;
        }

        if (k == bytes32("bondStage")) {
            bondStage = v;
            return;
        }

        if (k == bytes32("issuerStage")) {
            issuerStage = v;
            return;
        }
        revert("setBondParam: invalid bytes32 key");
    }

    function setBondParamAddress(bytes32 k, address v) external auth {
        if (k == bytes32("gov")) {
            gov = v;
            return;
        }

        if (k == bytes32("top")) {
            top = v;
            return;
        }
        revert("setBondParamAddress: invalid bytes32 key");
    }


    function getSupplyAmount(address who) external view returns (uint256) {
        return supplyMap[who].amountGive;
    }

    function getBorrowAmountGive() external view returns (uint256) {
        return issuerBalanceGive;
    }



    /** 清算记录流水号 */
    uint256 public liquidateIndexes;

    /** 分批清算设置标记 */
    bool public liquidating;
    function setLiquidating(bool _liquidating) external auth {
        liquidating = _liquidating;
    }

    /** 评级 */

    address public voteLogic;
    
    struct what {
        address proposal;
        uint256 weight;
    }

    struct prwhat {
        address who;
        address proposal;
        uint256 reason;
    }

    mapping(address => uint256) public voteLedger; //who => amount
    mapping(address => what) public votes; //who => what
    mapping(address => uint256) public weights; //proposal => weight
    mapping(address => uint256) public profits; //who => profit
    uint256 public totalProfits;    //累计已经被取走的投票收益, 用于对照 @fee.
    uint256 public totalWeights;
    address public gov;
    address public top;
    prwhat public pr;


    function setVotes(address who, address proposal, uint256 weight)
        external
        auth
    {
        votes[who].proposal = proposal;
        votes[who].weight = weight;
    }



    function setACL(
        address _ACL) external {
        require(msg.sender == ACL, "require ACL");
        ACL = _ACL;
    }


    function setPr(address who, address proposal, uint256 reason) external auth {
        pr.who = who;
        pr.proposal = proposal;
        pr.reason = reason;
    }

    
    function setBondParamMapping(bytes32 name, address k, uint256 v) external auth {
        if (name == bytes32("weights")) {
            weights[k] = v;
            return;
        }

        if (name == bytes32("profits")) {
            profits[k] = v;
            return;
        }
        revert("setBondParamMapping: invalid bytes32 name");
    }


    function vote(address proposal, uint256 amount) external nonReentrant {
        IVote(voteLogic).cast(id, msg.sender, proposal, amount);
        voteLedger[msg.sender] = voteLedger[msg.sender].add(amount);
        IERC20(gov).safeTransferFrom(msg.sender, address(this), amount);

        ICore(logic).MonitorEventCallback(msg.sender, address(this), "vote", abi.encodePacked(
            proposal,
            amount, 
            govTokenCash()
        ));
    }

    function take() external nonReentrant {
        uint256 amount = IVote(voteLogic).take(id, msg.sender);
        voteLedger[msg.sender] = voteLedger[msg.sender].sub(amount);
        IERC20(gov).safeTransfer(msg.sender, amount);

        ICore(logic).MonitorEventCallback(msg.sender, address(this), "take", abi.encodePacked(
            amount, 
            govTokenCash()
        ));
    }

    function profit() external nonReentrant {
        uint256 _profit = IVote(voteLogic).profit(id, msg.sender);
        IERC20(crowdToken).safeTransfer(msg.sender, _profit);

        ICore(logic).MonitorEventCallback(msg.sender, address(this), "profit", abi.encodePacked(
            _profit, 
            crowdTokenCash()
        ));
    }

    function withdrawSysProfit() external nonReentrant auth {
        uint256 _sysProfit = ICore(logic).withdrawSysProfitCb(msg.sender, id);
        require(_sysProfit <= totalFee() && (bondStage == uint(BondStage.RepaySuccess) || bondStage == uint(BondStage.DebtClosed)), "> totalFee");

        IERC20(crowdToken).safeTransfer(msg.sender, _sysProfit);
        ICore(logic).MonitorEventCallback(msg.sender, address(this), "withdrawSysProfit", abi.encodePacked(
            _sysProfit,
            crowdTokenCash()
        ));
    }

    function burnBond(address who, uint256 amount) external auth {
        _burn(who, amount);
        actualBondIssuance = actualBondIssuance.sub(amount);
    }

    function mintBond(address who, uint256 amount) external auth {
        _mint(who, amount);
        mintCnt = mintCnt.add(amount);
        actualBondIssuance = actualBondIssuance.add(amount);
    }

    function txn(address sender, address recipient, uint256 bondAmount, bytes32 name) internal {
        uint256 txAmount = bondAmount.mul(par).mul(10**uint256(crowdDecimals()));
        supplyMap[sender].amountGive = supplyMap[sender].amountGive.sub(txAmount);
        supplyMap[sender].amountGet = supplyMap[sender].amountGet.sub(bondAmount);
        supplyMap[recipient].amountGive = supplyMap[recipient].amountGive.add(txAmount);
        supplyMap[recipient].amountGet = supplyMap[recipient].amountGet.add(bondAmount);

        ICore(logic).MonitorEventCallback(sender, address(this), name, abi.encodePacked(
            recipient,
            bondAmount
        ));
    }

    function transfer(address recipient, uint256 bondAmount) 
        public override(IERC20, ERC20) nonReentrant
        returns (bool)
    {
        txn(msg.sender, recipient, bondAmount, "transfer");
        return ERC20.transfer(recipient, bondAmount);
    }

    function transferFrom(address sender, address recipient, uint256 bondAmount)
        public override(IERC20, ERC20) nonReentrant
        returns (bool)
    {
        txn(sender, recipient, bondAmount, "transferFrom");
        return ERC20.transferFrom(sender, recipient, bondAmount);
    }

    mapping(address => uint256) public depositLedger;
    function crowdDecimals() public view returns (uint8) {
        return ERC20Detailed(crowdToken).decimals();
    }

    //可转出金额,募集到的总资金减去给所有投票人的手续费
    function transferableAmount() public view returns (uint256) {
        uint256 baseDec = 18;
        uint256 _1 = 1 ether;
        //principal * (1-0.05) * 1e18/(10** (18 - 6))
        return
            mintCnt.mul(par).mul((_1).sub(issueFee)).div(
                10**baseDec.sub(uint256(crowdDecimals()))
            );
    }

    function totalFee() public view returns (uint256) {
        uint256 baseDec = 18;
        uint256 delta = baseDec.sub(
            uint256(crowdDecimals())
        );
        //principal * (0.05) * 1e18/(10** (18 - 6))
        return mintCnt.mul(par).mul(issueFee).div(10**delta);
    }

    //追加抵押物
    function deposit(uint256 amount) external nonReentrant payable {
        require(ICore(logic).depositCb(msg.sender, id, amount), "deposit err");
        depositLedger[msg.sender] = depositLedger[msg.sender].add(amount);
        if (collateralToken != address(0)) {
            IERC20(collateralToken).safeTransferFrom(msg.sender, address(this), amount);
        } else {
            require(amount == msg.value && msg.value > 0, "deposit eth err");
        }

        ICore(logic).MonitorEventCallback(msg.sender, address(this), "deposit", abi.encodePacked(
            amount, 
            collateralTokenCash()
        ));
    }

    function collateralTokenCash() internal view returns (uint256) {
        return collateralToken != address(0) ? IERC20(collateralToken).balanceOf(address(this)) : address(this).balance;
    }

    function crowdTokenCash() internal view returns (uint256) {
        return IERC20(crowdToken).balanceOf(address(this));
    }

    function govTokenCash() internal view returns (uint256) {
        return IERC20(gov).balanceOf(address(this));
    }

    //首次加入抵押物
    function initialDeposit(address who, uint256 amount) external auth nonReentrant payable {
        depositLedger[who] = depositLedger[who].add(amount);
        if (collateralToken != address(0)) {
            IERC20(collateralToken).safeTransferFrom(msg.sender, address(this), amount);
        } else {
	        require(amount == msg.value && msg.value > 0, "initDeposit eth err");
	    }

        ICore(logic).initialDepositCb(id, amount);

        ICore(logic).MonitorEventCallback(who, address(this), "initialDeposit", abi.encodePacked(
            amount, 
            collateralTokenCash()
        ));
    }

    function invest(uint256 amount) external nonReentrant {
        if (ICore(logic).investCb(msg.sender, id, amount)) {
            supplyMap[msg.sender].amountGive = supplyMap[msg.sender].amountGive.add(amount);
            supplyMap[msg.sender].amountGet = supplyMap[msg.sender].amountGet.add(amount.div(par.mul(10**uint256(crowdDecimals()))));

            //充值amount token到合约中，充值之前需要approve
            IERC20(crowdToken).safeTransferFrom(msg.sender, address(this), amount);
        }

        ICore(logic).MonitorEventCallback(msg.sender, address(this), "invest", abi.encodePacked(
            amount, 
            crowdTokenCash()
        ));
    }

    function txOutCrowd() external nonReentrant {
        uint256 balance = ICore(logic).txOutCrowdCb(msg.sender, id);
        require(balance <= transferableAmount(), "exceed max tx amount");


        IERC20(crowdToken).safeTransfer(msg.sender, balance);



        ICore(logic).MonitorEventCallback(msg.sender, address(this), "txOutCrowd", abi.encodePacked(
            balance, 
            crowdTokenCash()
        ));
    }

    function overdue() external {
        ICore(logic).overdueCb(id);
    }

    function repay() external nonReentrant {
        uint repayAmount = ICore(logic).repayCb(msg.sender, id);

        IERC20(crowdToken).safeTransferFrom(msg.sender, address(this), repayAmount);

        ICore(logic).MonitorEventCallback(msg.sender, address(this), "repay", abi.encodePacked(
            repayAmount, 
            crowdTokenCash()
        ));
    }

    function withdrawPawn() external nonReentrant {
        uint amount = ICore(logic).withdrawPawnCb(msg.sender, id);
        depositLedger[msg.sender] = depositLedger[msg.sender].sub(amount);
        if (collateralToken != address(0)) {

            IERC20(collateralToken).safeTransfer(msg.sender, amount);
        } else {
            msg.sender.transfer(amount);
        }

        ICore(logic).MonitorEventCallback(msg.sender, address(this), "withdrawPawn", abi.encodePacked(
            amount, 
            collateralTokenCash()
        ));
    }

    function withdrawInvest(address who, uint amount, bytes32 name) internal {
        IERC20(crowdToken).safeTransfer(who, amount);
        ICore(logic).MonitorEventCallback(who, address(this), name, abi.encodePacked(
            amount, 
            crowdTokenCash()
        ));
    }

    function withdrawPrincipal() external nonReentrant {
        uint256 supplyGive = ICore(logic).withdrawPrincipalCb(msg.sender, id);
        supplyMap[msg.sender].amountGive = supplyMap[msg.sender].amountGet = 0;
        withdrawInvest(msg.sender, supplyGive, "withdrawPrincipal");
    }

    function withdrawPrincipalAndInterest() external nonReentrant {
        uint256 amount = ICore(logic).withdrawPrincipalAndInterestCb(msg.sender, id);
        uint256 _1 = 1 ether;
        require(amount <= supplyMap[msg.sender].amountGive.mul(_1.add(couponRate)).div(_1) && supplyMap[msg.sender].amountGive != 0, "exceed max invest amount or not an invester");
        supplyMap[msg.sender].amountGive = supplyMap[msg.sender].amountGet = 0;

        withdrawInvest(msg.sender, amount, "withdrawPrincipalAndInterest");
    }

    //分批清算,y为债务
    function liquidate(uint liquidateAmount) external nonReentrant {
        (uint y1, uint x1, uint y, uint x) = ICore(logic).liquidateCb(msg.sender, id, liquidateAmount);

        if (collateralToken != address(0)) {

            IERC20(collateralToken).safeTransfer(msg.sender, x1);
        } else {
            msg.sender.transfer(x1);
        }



        IERC20(crowdToken).safeTransferFrom(msg.sender, address(this), y1);

        ICore(logic).MonitorEventCallback(msg.sender, address(this), "liquidate", abi.encodePacked(
            liquidateIndexes, 
            x1, 
            y1,
            x,
            y,
            now, 
            collateralTokenCash(),
            crowdTokenCash()
        ));
        liquidateIndexes = liquidateIndexes.add(1);
    }
}
