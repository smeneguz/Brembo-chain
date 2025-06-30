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

contract RotorProcessTracker is ERC721, ERC721Holder, Ownable, IPhaseContract {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Mappatura per tracciare se una fase per un dato codice flangia è completata
    mapping(string => bool) private phaseCompletion;

    mapping(uint256 => Rotor) private _rotors;
    mapping(string => uint256) private _codiceFlangiaToTokenId;

    event RotorPhaseUpdated(
        uint256 tokenId,
        string codiceFlangia,
        string stazioneDiLavorazione
    );

    event RotorCreated(uint256 tokenId, string codiceFlangia);

    constructor() ERC721("RotorProcess", "RTP") {}

    modifier validPhaseIndex(uint phaseIndex) {
        require(phaseIndex < 2, "Invalid phase index");
        _;
    }

    modifier rotorExists(string memory codiceFlangia) {
        uint256 tokenId = _codiceFlangiaToTokenId[codiceFlangia];
        require(tokenId != 0, "Rotor does not exist");
        _;
    }

    modifier rotorInitialized(uint256 tokenId) {
        require(_rotors[tokenId].exists, "Rotor not initialized");
        _;
    }

    modifier rotorNotExists(string memory codiceFlangia) {
        require(
            _codiceFlangiaToTokenId[codiceFlangia] == 0,
            "Rotor already exists"
        );
        _;
    }

    struct RotorPhase {
        string statoComponente;
        string stazioneDiLavorazione;
        string consumoEnergia;
        bytes32 hash;
    }

    struct Rotor {
        string codiceFlangia;
        RotorPhase[2] phases;
        bool exists;
    }

    function createRotor(
        string memory codiceFlangia
    ) public onlyOwner rotorNotExists(codiceFlangia) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _safeMint(owner(), newTokenId);

        Rotor storage newRotor = _rotors[newTokenId];
        newRotor.codiceFlangia = codiceFlangia;
        newRotor.exists = true;

        _codiceFlangiaToTokenId[codiceFlangia] = newTokenId;

        emit RotorCreated(newTokenId, codiceFlangia);
    }

    function updateRotorPhase(
        string memory codiceFlangia,
        uint phaseIndex,
        string memory statoComponente,
        string memory stazioneDiLavorazione,
        string memory consumoEnergia,
        bytes32 hash
    )
        public
        onlyOwner
        rotorExists(codiceFlangia)
        rotorInitialized(_codiceFlangiaToTokenId[codiceFlangia])
        validPhaseIndex(phaseIndex)
    {
        uint256 tokenId = _codiceFlangiaToTokenId[codiceFlangia];

        // Verifica che la fase precedente sia stata completata (eccetto per la prima fase)
        if (phaseIndex > 0) {
            require(
                bytes(_rotors[tokenId].phases[phaseIndex - 1].statoComponente)
                    .length != 0,
                "Previous phase not completed"
            );
        }
        RotorPhase storage phase = _rotors[tokenId].phases[phaseIndex];
        phase.statoComponente = statoComponente;
        phase.stazioneDiLavorazione = stazioneDiLavorazione;
        phase.consumoEnergia = consumoEnergia;
        phase.hash = hash;

        if (phaseIndex == 1) {
            phaseCompletion[codiceFlangia] = true;
        }

        emit RotorPhaseUpdated(tokenId, codiceFlangia, stazioneDiLavorazione);
    }

    function getRotorPhase(
        string memory codiceFlangia,
        uint phaseIndex
    )
        public
        view
        validPhaseIndex(phaseIndex)
        rotorExists(codiceFlangia)
        rotorInitialized(_codiceFlangiaToTokenId[codiceFlangia])
        returns (RotorPhase memory)
    {
        uint256 tokenId = _codiceFlangiaToTokenId[codiceFlangia];
        return _rotors[tokenId].phases[phaseIndex];
    }

    function getRotor(
        string memory codiceFlangia
    )
        public
        view
        rotorExists(codiceFlangia)
        rotorInitialized(_codiceFlangiaToTokenId[codiceFlangia])
        returns (Rotor memory)
    {
        uint256 tokenId = _codiceFlangiaToTokenId[codiceFlangia];
        return _rotors[tokenId];
    }

    function verify(
        string memory codiceFlangia,
        uint phaseIndex,
        bytes32 xmlHash
    )
        public
        view
        rotorExists(codiceFlangia)
        rotorInitialized(_codiceFlangiaToTokenId[codiceFlangia])
        validPhaseIndex(phaseIndex)
        returns (bool)
    {
        uint256 tokenId = _codiceFlangiaToTokenId[codiceFlangia];

        // Ottiene la fase del rotore specificata e verifica l'hash
        RotorPhase storage phase = _rotors[tokenId].phases[phaseIndex];
        return phase.hash == xmlHash;
    }

    function isPhaseComplete(
        string memory codiceUnivoco
    ) external view override returns (bool) {
        return phaseCompletion[codiceUnivoco];
    }
}
