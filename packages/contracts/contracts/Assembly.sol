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

contract AssemblyProcessTracker is
    ERC721,
    ERC721Holder,
    Ownable,
    IPhaseContract
{
    using Counters for Counters.Counter;
    Counters.Counter private _assemblyIds;

    mapping(uint256 => AssemblyItem) private _assemblyItems;
    mapping(string => uint256) private _codiceMotoreToAssemblyId;

    IPhaseContract private statorPhaseContract;
    IPhaseContract private rotorPhaseContract;

    event AssemblyPhaseUpdated(
        uint256 assemblyId,
        string codiceMotore,
        uint phaseIndex
    );
    event AssemblyCreated(uint256 assemblyId, string codiceMotore);

    struct AssemblyPhase {
        string statoComponente;
        string stazioneDiLavorazione;
        string consumeEnergia;
        // Considera l'aggiunta di altri campi rilevanti per l'assembly.
        bytes32 hash;
        bool isComplete;
    }

    struct AssemblyItem {
        string codiceMotore;
        AssemblyPhase[3] phases; // Definisce un array di 3 fasi per l'assembly
        bool exists;
    }

    constructor(
        address _phaseStatorContractAddress,
        address _phaseRotorContractAddress
    ) ERC721("AssemblyProcess", "ASP") {
        statorPhaseContract = IPhaseContract(_phaseStatorContractAddress);
        rotorPhaseContract = IPhaseContract(_phaseRotorContractAddress);
    }

    modifier validPhaseIndex(uint phaseIndex) {
        require(phaseIndex >= 0 && phaseIndex < 3, "Invalid phase index");
        _;
    }

    modifier assemblyExists(string memory codiceMotore) {
        require(
            _codiceMotoreToAssemblyId[codiceMotore] != 0,
            "Assembly does not exist"
        );
        _;
    }

    modifier assemblyNotExists(string memory codiceMotore) {
        require(
            _codiceMotoreToAssemblyId[codiceMotore] == 0,
            "Assembly already exists"
        );
        _;
    }

    modifier assemblyInitialized(uint256 tokenId) {
        require(_assemblyItems[tokenId].exists, "Assembly not initialized");
        _;
    }

    function createAssembly(
        string memory codiceMotore
    ) public onlyOwner assemblyNotExists(codiceMotore) {
        _assemblyIds.increment();
        uint256 newAssemblyId = _assemblyIds.current();

        _safeMint(owner(), newAssemblyId);

        AssemblyItem storage newItem = _assemblyItems[newAssemblyId];
        newItem.codiceMotore = codiceMotore;
        newItem.exists = true;

        _codiceMotoreToAssemblyId[codiceMotore] = newAssemblyId;

        emit AssemblyCreated(newAssemblyId, codiceMotore);
    }

    function updateAssemblyPhase(
        string memory codiceMotore,
        string memory codiceFlangia,
        uint phaseIndex,
        string memory statoComponente,
        string memory stazioneDiLavorazione,
        string memory consumoEnergia,
        bytes32 hash
    )
        public
        onlyOwner
        validPhaseIndex(phaseIndex)
        assemblyExists(codiceMotore)
        assemblyInitialized(_codiceMotoreToAssemblyId[codiceMotore])
    {
        if (phaseIndex == 0) {
            require(
                address(statorPhaseContract) != address(0),
                "Stator contract address cannot be the zero address"
            );
            require(
                address(rotorPhaseContract) != address(0),
                "Rotor contract address cannot be the zero address"
            );
            require(
                statorPhaseContract.isPhaseComplete(codiceMotore) &&
                    rotorPhaseContract.isPhaseComplete(codiceFlangia),
                "Stator and/or Rotor last phase not completed"
            );
        }

        uint256 assemblyId = _codiceMotoreToAssemblyId[codiceMotore];
        AssemblyItem storage item = _assemblyItems[assemblyId];

        require(!item.phases[phaseIndex].isComplete, "Phase already completed");
        if (phaseIndex > 0) {
            require(
                item.phases[phaseIndex - 1].isComplete,
                "Previous phase not completed"
            );
        }

        AssemblyPhase storage phase = item.phases[phaseIndex];
        phase.statoComponente = statoComponente;
        phase.stazioneDiLavorazione = stazioneDiLavorazione;
        phase.consumeEnergia = consumoEnergia;
        phase.hash = hash;
        phase.isComplete = true;

        emit AssemblyPhaseUpdated(assemblyId, codiceMotore, phaseIndex);
    }

    function getAssemblyPhase(
        string memory codiceMotore,
        uint phaseIndex
    )
        public
        view
        validPhaseIndex(phaseIndex)
        assemblyExists(codiceMotore)
        assemblyInitialized(_codiceMotoreToAssemblyId[codiceMotore])
        returns (AssemblyPhase memory)
    {
        uint256 tokenId = _codiceMotoreToAssemblyId[codiceMotore];
        return _assemblyItems[tokenId].phases[phaseIndex];
    }

    function getAssembly(
        string memory codiceMotore
    )
        public
        view
        assemblyExists(codiceMotore)
        assemblyInitialized(_codiceMotoreToAssemblyId[codiceMotore])
        returns (AssemblyItem memory)
    {
        uint256 tokenId = _codiceMotoreToAssemblyId[codiceMotore];
        return _assemblyItems[tokenId];
    }

    function verify(
        string memory codiceMotore,
        uint phaseIndex,
        bytes32 xmlHash
    )
        public
        view
        assemblyExists(codiceMotore)
        assemblyInitialized(_codiceMotoreToAssemblyId[codiceMotore])
        validPhaseIndex(phaseIndex)
        returns (bool)
    {
        uint256 tokenId = _codiceMotoreToAssemblyId[codiceMotore];

        // Ottiene la fase dell'AssemblyItem specificata e verifica l'hash
        AssemblyPhase storage phase = _assemblyItems[tokenId].phases[
            phaseIndex
        ];
        return phase.hash == xmlHash;
    }

    function isPhaseComplete(
        string memory codiceMotore
    ) external view override returns (bool) {
        uint256 tokenId = _codiceMotoreToAssemblyId[codiceMotore];
        return _assemblyItems[tokenId].phases[2].isComplete;
    }
}
