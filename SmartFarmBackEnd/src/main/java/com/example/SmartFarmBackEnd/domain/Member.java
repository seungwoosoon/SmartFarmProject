package com.example.SmartFarmBackEnd.domain;

import jakarta.persistence.*;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
public class Member {
    @Id
    @GeneratedValue
    @Column(name = "member_id")
    private Long id;

    private String login;
    private String password;
    private String name;
    private String phoneNumber;

    @Embedded
    private Address address;

    @OneToMany(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<FarmShelf> farmShelves = new ArrayList<>();

    public void addFarmShelf(FarmShelf farmShelf) {
        this.farmShelves.add(farmShelf);
        farmShelf.linkMember(this);
    }
}