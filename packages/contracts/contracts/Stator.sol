// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

interface IPhaseContract {
    function isPhaseComplete(
        string memory codiceUnivoco
    ) external view returns (bool);
}

contract StatorProcessTracker is ERC721, ERC721Holder, Ownable, IPhaseContract {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => Stator) private _stators;
    mapping(string => uint256) private _codiceMotoreToTokenId;

    // Mappatura per tracciare se una fase per un dato codice motore è completata
    mapping(string => bool) private phaseCompletion;

    event StatorPhaseUpdated(
        uint256 tokenId,
        string codiceMotore,
        string stazioneDiLavorazione
    );

    event StatorCreated(uint256 tokenId, string codiceMotore);

    constructor() ERC721("StatorProcess", "STP") {}

    modifier validPhaseIndex(uint phaseIndex) {
        require(phaseIndex < 12, "Invalid phase index");
        _;
    }

    modifier statorExists(string memory codiceMotore) {
        uint256 tokenId = _codiceMotoreToTokenId[codiceMotore];
        require(tokenId != 0, "Stator does not exist");
        _;
    }

    modifier statorInitialized(uint256 tokenId) {
        require(_stators[tokenId].exists, "Stator not initialized");
        _;
    }

    modifier statorNotExists(string memory codiceMotore) {
        require(
            _codiceMotoreToTokenId[codiceMotore] == 0,
            "Stator already exists"
        );
        _;
    }

    struct StatorPhase {
        string statoComponente;
        string stazioneDiLavorazione;
        string consumoEnergia;
        bytes32 hash;
        // Aggiungi qui eventuali altri campi rilevanti come lottoHousing, lottoResina, ecc.
    }

    struct Stator {
        string codiceMotore;
        StatorPhase[12] phases; // Array fisso per le 12 fasi
        bool exists;
    }

    function createStator(
        string memory codiceMotore
    ) public onlyOwner statorNotExists(codiceMotore) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _safeMint(owner(), newTokenId);

        Stator storage newStator = _stators[newTokenId];
        newStator.codiceMotore = codiceMotore;
        newStator.exists = true;

        _codiceMotoreToTokenId[codiceMotore] = newTokenId;

        emit StatorCreated(newTokenId, codiceMotore);
    }

    function updateStatorPhase(
        string memory codiceMotore,
        uint phaseIndex,
        string memory statoComponente,
        string memory stazioneDiLavorazione,
        string memory consumoEnergia,
        bytes32 hash
    )
        public
        onlyOwner
        validPhaseIndex(phaseIndex)
        statorExists(codiceMotore)
        statorInitialized(_codiceMotoreToTokenId[codiceMotore])
    {
        uint256 tokenId = _codiceMotoreToTokenId[codiceMotore];
        // Verifica che la fase precedente sia stata completata (eccetto per la prima fase)
        if (phaseIndex > 0) {
            require(
                bytes(_stators[tokenId].phases[phaseIndex - 1].statoComponente)
                    .length != 0,
                "Previous phase not completed"
            );
        }

        StatorPhase storage phase = _stators[tokenId].phases[phaseIndex];
        phase.statoComponente = statoComponente;
        phase.stazioneDiLavorazione = stazioneDiLavorazione;
        phase.consumoEnergia = consumoEnergia;
        phase.hash = hash;

        if (phaseIndex == 11) {
            phaseCompletion[codiceMotore] = true;
        }

        emit StatorPhaseUpdated(tokenId, codiceMotore, stazioneDiLavorazione);
    }

    function getStatorPhase(
        string memory codiceMotore,
        uint phaseIndex
    )
        public
        view
        validPhaseIndex(phaseIndex)
        statorExists(codiceMotore)
        statorInitialized(_codiceMotoreToTokenId[codiceMotore])
        returns (StatorPhase memory)
    {
        uint256 tokenId = _codiceMotoreToTokenId[codiceMotore];
        return _stators[tokenId].phases[phaseIndex];
    }

    function getStator(
        string memory codiceMotore
    )
        public
        view
        statorExists(codiceMotore)
        statorInitialized(_codiceMotoreToTokenId[codiceMotore])
        returns (Stator memory)
    {
        uint256 tokenId = _codiceMotoreToTokenId[codiceMotore];
        return _stators[tokenId];
    }

    function verify(
        string memory codiceMotore,
        uint phaseIndex,
        bytes32 xmlHash
    )
        public
        view
        statorExists(codiceMotore)
        statorInitialized(_codiceMotoreToTokenId[codiceMotore])
        validPhaseIndex(phaseIndex)
        returns (bool)
    {
        uint256 tokenId = _codiceMotoreToTokenId[codiceMotore];

        // Ottiene la fase dello statore specificata e verifica l'hash
        StatorPhase storage phase = _stators[tokenId].phases[phaseIndex];
        return phase.hash == xmlHash;
    }

    function isPhaseComplete(
        string memory codiceUnivoco
    ) external view override returns (bool) {
        return phaseCompletion[codiceUnivoco];
    }
}
