package com.example.SmartFarmBackEnd.service;

import com.example.SmartFarmBackEnd.domain.Pot;
import com.example.SmartFarmBackEnd.domain.PotStatus;
import com.example.SmartFarmBackEnd.domain.ShelfFloor;
import com.example.SmartFarmBackEnd.repository.PotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
@Service
@RequiredArgsConstructor
public class PotService {

    private final PotRepository potRepository;

    public List<Pot> getPotsByMemberId(Long memberId) {
        return potRepository.findAllByMemberId(memberId);
    }

    public List<Pot> getPotsByShelfId(Long shelfId) {
        return potRepository.findAllByShelfId(shelfId);
    }

    public List<Pot> getPotsByFloor(ShelfFloor floor) {
        return potRepository.findByShelfFloor(floor);
    }

    public List<Pot> getPotsByStatus(PotStatus status) {
        return potRepository.findByStatus(status);
    }
    public void removePot(Long potId) {
        Pot pot = potRepository.findOne(potId);
        if (pot == null) throw new IllegalArgumentException("Pot not found");
        potRepository.delete(pot);
    }
}