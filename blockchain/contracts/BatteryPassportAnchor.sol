pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract BatteryPassportAnchor is ERC721, AccessControl {
    bytes32 public constant ANCHOR_ROLE = keccak256("ANCHOR_ROLE");

    struct PassportData {
        string adi;
        string dbSha256Hash;
        string ipfsCid;
        uint256 timestamp;
    }

    mapping(uint256 => PassportData) private _passports;
    mapping(string => bool) private _adiRegistered;
    uint256 private _nextTokenId;

    event PassportAnchored(
        uint256 indexed tokenId,
        address indexed to,
        string adi,
        string dbSha256Hash,
        string ipfsCid,
        uint256 timestamp
    );

    constructor(address admin) ERC721("Battery Passport Anchor", "BPA") {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ANCHOR_ROLE, admin);
    }

    function anchorPassport(
        address to,
        string memory adi,
        string memory dbHash,
        string memory cid
    ) external onlyRole(ANCHOR_ROLE) returns (uint256 tokenId) {
        require(bytes(adi).length != 0, "BPA: empty adi");
        require(bytes(dbHash).length != 0, "BPA: empty hash");
        require(bytes(cid).length != 0, "BPA: empty cid");
        require(!_adiRegistered[adi], "BPA: adi already anchored");

        _adiRegistered[adi] = true;
        tokenId = _nextTokenId++;

        _passports[tokenId] = PassportData({
            adi: adi,
            dbSha256Hash: dbHash,
            ipfsCid: cid,
            timestamp: block.timestamp
        });

        _safeMint(to, tokenId);

        emit PassportAnchored(tokenId, to, adi, dbHash, cid, block.timestamp);
    }

    function verifyHash(uint256 tokenId, string memory frontendGeneratedHash)
        external
        view
        returns (bool)
    {
        _requireAnchored(tokenId);
        return
            keccak256(bytes(_passports[tokenId].dbSha256Hash)) ==
            keccak256(bytes(frontendGeneratedHash));
    }

    function getPassportDetails(uint256 tokenId)
        external
        view
        returns (
            string memory adi,
            string memory dbSha256Hash,
            string memory ipfsCid,
            uint256 timestamp
        )
    {
        _requireAnchored(tokenId);
        PassportData storage p = _passports[tokenId];
        return (p.adi, p.dbSha256Hash, p.ipfsCid, p.timestamp);
    }

    function isAdiAnchored(string memory adi) external view returns (bool) {
        return _adiRegistered[adi];
    }

    function totalAnchored() external view returns (uint256) {
        return _nextTokenId;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireAnchored(tokenId);
        return string.concat("ipfs://", _passports[tokenId].ipfsCid);
    }

    function _requireAnchored(uint256 tokenId) private view {
        require(_passports[tokenId].timestamp != 0, "BPA: unknown tokenId");
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
