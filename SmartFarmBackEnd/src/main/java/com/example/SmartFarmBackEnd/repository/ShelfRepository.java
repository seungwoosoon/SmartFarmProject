package com.example.SmartFarmBackEnd.repository;

import com.example.SmartFarmBackEnd.domain.Shelf;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ShelfRepository {
    private final EntityManager em;

    public Long save(Shelf shelf) {
        em.persist(shelf);
        return shelf.getId();
    }

}
