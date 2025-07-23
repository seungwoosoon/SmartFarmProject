package com.example.SmartFarmBackEnd.domain;

import jakarta.persistence.*;
import lombok.Getter;

@Entity
@Getter
public class Pot {
    @Id
    @GeneratedValue
    @Column(name = "pot_id")
    private Long id;

    @Enumerated(EnumType.STRING)
    private Plant plant;

    private double humidity;
    private double temperature;
    private double tts_density;
    private double light_strength;

    @Enumerated(EnumType.STRING)
    private PotStatus potStatus;

    @Enumerated(EnumType.STRING)
    private FloorLevel floorLevel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shelf_id")
    private FarmShelf farmShelf;

    // 연관관계 설정 메서드만 공개
    public void linkFarmShelf(FarmShelf farmShelf) {
        this.farmShelf = farmShelf;
    }
}