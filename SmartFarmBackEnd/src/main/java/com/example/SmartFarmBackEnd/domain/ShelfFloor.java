package com.example.SmartFarmBackEnd.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor
public class ShelfFloor {

    @Id @GeneratedValue
    @Column(name = "floor_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shelf_id")
    private Shelf shelf;

    @Column(name = "position")
    private Integer position; // Shelf 내부에서의 층 위치 인덱스

    @OneToMany(mappedBy = "shelfFloor", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Pot> pots = new ArrayList<>();

    public void setPosition(int position) {
        this.position = position;
    }
    public void linkShelf(Shelf shelf) {
        this.shelf = shelf;
    }
    public void addPot(Pot pot) {
        pots.add(pot);
        pot.linkShelfFloor(this);
    }
}