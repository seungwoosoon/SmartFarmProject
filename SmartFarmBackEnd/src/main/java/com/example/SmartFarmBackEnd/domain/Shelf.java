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
public class Shelf {

    @Id @GeneratedValue
    @Column(name = "shelf_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @Column(name = "shelf_position")
    private Integer position; // Member 내부에서의 선반 위치 인덱스

    @OneToMany(mappedBy = "shelf", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ShelfFloor> shelfFloors = new ArrayList<>();

    public void setPosition(int position) {
        this.position = position;
    }
    public void linkMember(Member member) {
        this.member = member;
    }
}
