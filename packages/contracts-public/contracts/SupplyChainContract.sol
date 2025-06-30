// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SupplyChainContract is ERC721, ERC721Holder, Ownable {
    uint256 private _tokenIdCounter;
    mapping(uint256 => Brake) private _brake;
    mapping(string => uint256) private _codiceMotoreToTokenId;
    mapping(address => Brake[]) private _ownerToBrake;

    event BrakeCreated(uint256 tokenId, string energia);
    event OwnershipChanged(Brake brake);

    struct Brake {
        string codiceMotore;
        string consumoEnergia; // random tra valori medi di tutte le altre macchine (20% di variabilità)
        bytes32 hash;
        string createdAt; // time piece was created
        string cpd;
        uint256 tokenId;
        bool exists;
        // string hash del file
        // string data creazione
    }

    constructor() ERC721("BrakeEspe", "BEP") {}

    function createBrakeEspe(
        string memory codiceMotore,
        string memory consumoEnergia,
        bytes32 hash,
        string memory createdAt,
        string memory cpd
    ) public onlyOwner {
        //inizialmente associo la ownership all'owner del contratto. Solo se mi viene data la giusta passphrase
        //lo metto all'utente metamask
        _safeMint(owner(), _tokenIdCounter);

        Brake storage newBrake = _brake[_tokenIdCounter];
        newBrake.exists = true;
        newBrake.codiceMotore = codiceMotore;
        newBrake.consumoEnergia = consumoEnergia;
        newBrake.tokenId = _tokenIdCounter;
        newBrake.hash = hash;
        newBrake.createdAt = createdAt;
        newBrake.cpd = cpd;
        _codiceMotoreToTokenId[codiceMotore] = _tokenIdCounter;
        _tokenIdCounter += 1;

        emit BrakeCreated(_tokenIdCounter - 1, newBrake.consumoEnergia);
    }

    //nel mio backend faccio check con la frase segreta e il codice motore?? Insomma con un identicativo del pezzo in generale
    //se coincide il backend mi chiama con le credenziali dell'owner e mi dice chi ha fatto
    function transferOwnership(
        address newOwner,
        string memory codiceMotore
    ) public onlyOwner {
        require(
            _brake[_codiceMotoreToTokenId[codiceMotore]].exists == true,
            "Error: codiceMotore not valid!"
        );
        require(
            ownerOf(_brake[_codiceMotoreToTokenId[codiceMotore]].tokenId) ==
                owner(),
            "Nft ownership was already transferred to someone else"
        );
        safeTransferFrom(
            msg.sender,
            newOwner,
            _codiceMotoreToTokenId[codiceMotore]
        );
        _ownerToBrake[newOwner].push(
            _brake[_codiceMotoreToTokenId[codiceMotore]]
        );
        emit OwnershipChanged(_brake[_tokenIdCounter]);
    }

    function checkExistenceToken(
        string calldata _codiceMotore
    ) public view returns (bool) {
        return _brake[_codiceMotoreToTokenId[_codiceMotore]].exists;
    }

    function getOwnershipBrake(
        address owner
    ) public view returns (Brake[] memory) {
        return _ownerToBrake[owner];
    }
}
