package com.example.SmartFarmBackEnd.domain;

import jakarta.persistence.*;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
public class FarmShelf {
    @Id
    @GeneratedValue
    @Column(name = "shelf_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    @OneToMany(mappedBy = "farmShelf", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Pot> pots = new ArrayList<>(5);

    // 연관관계 설정 메서드
    public void linkMember(Member member) {
        this.member = member;
    }
    // 연관관계 편의 메서드
    public void addOverCapacity(Pot pot) {
        pots.add(pot);
        pot.linkFarmShelf(this);
    }
    public void insertPot(Pot pot, int location) {
        if (location < 0 || location > pots.size()) {
            throw new IndexOutOfBoundsException("위치가 잘못되었습니다: " + location);
        }
        pots.add(location, pot);        // 리스트에 삽입
        pot.linkFarmShelf(this);         // 양방향 관계 설정
    }
}