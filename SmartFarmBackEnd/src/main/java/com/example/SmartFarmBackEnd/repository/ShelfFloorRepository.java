package com.example.SmartFarmBackEnd.repository;

import com.example.SmartFarmBackEnd.domain.ShelfFloor;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ShelfFloorRepository {
    private final EntityManager em;

    public Long save(ShelfFloor shelfFloor) {
        em.persist(shelfFloor);
        return shelfFloor.getId();
    }

}