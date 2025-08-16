package com.example.SmartFarmBackEnd.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
@Entity
@Getter
@NoArgsConstructor
public class Pot {

    @Id @GeneratedValue
    @Column(name = "pot_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "floor_id")
    private ShelfFloor shelfFloor;

    private double exp = 0.0;

    @Column(name = "position")
    private Integer position; // 해당 층(ShelfFloor) 내 항아리 위치

    @Enumerated(EnumType.STRING)
    private Plant potPlant = Plant.EMPTY;

    @Enumerated(EnumType.STRING)
    private PotStatus status = PotStatus.EMPTY;

    private double ph;
    private double temperature;
    private double lightStrength;
    private double ttsDensity;
    private double humidity;

    public void setPosition(int position) {
        this.position = position;
    }
    public void updateStatus(
        PotStatus status,
        double ph,
        double temperature,
        double lightStrength,
        double ttsDensity,
        double humidity,
        double exp,
        Plant plant
) {
    this.status = status;
    this.ph = ph;
    this.temperature = temperature;
    this.lightStrength = lightStrength;
    this.ttsDensity = ttsDensity;
    this.humidity = humidity;
    this.exp = exp;
    this.potPlant = plant;
}


    // public void updateStatus(
    //         PotStatus status,
    //         double ph,
    //         double temperature,
    //         double lightStrength,
    //         double ttsDensity,
    //         double humidity,
    //         double exp,
    //         Plant plant // nullable
    // ) {
    //     this.status = status;
    //     this.ph = ph;
    //     this.temperature = temperature;
    //     this.lightStrength = lightStrength;
    //     this.ttsDensity = ttsDensity;
    //     this.potPlant = plant;
    //     this.exp = exp;
    //     this.humidity = humidity;
    // }

    public void applyStatus(PotStatus newStatus) {
        if (newStatus != null && !newStatus.equals(this.status)) {
            this.status = newStatus;
        }
    }
    // Pot.java (메서드만 추가)
    public void applySensor(
            Double ph,
            Double temperature,
            Double lightStrength,   // cds
            Double ttsDensity,      // tds
            Double humidity,
            PotStatus newStatus,    // null이면 상태 유지
            Double expIncrease      // 누적 가산치 (null이면 0)
    ) {
        if (ph != null) this.ph = ph;
        if (temperature != null) this.temperature = temperature;
        if (lightStrength != null) this.lightStrength = lightStrength;
        if (ttsDensity != null) this.ttsDensity = ttsDensity;
        if (humidity != null) this.humidity = humidity;
        if (newStatus != null) this.status = this.status;
        if (expIncrease != null) this.exp += expIncrease;
    }
    public void linkShelfFloor(ShelfFloor floor) {
        this.shelfFloor = floor;
    }

    public void applyExp(double expIncrease) {
        this.exp += expIncrease;
        if (exp == 1.0) {
            this.potPlant = Plant.COMPLETE;
        } else if (exp > 0.6) {
            this.potPlant = Plant.FRUIT;
        } else if (exp > 0.3) {
            this.potPlant = Plant.FLOWER;
        } else if (exp >= 0) {
            this.potPlant = Plant.SPROUT;
        }
    }
}