package com.example.SmartFarmBackEnd.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
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
    private List<Shelf> farmShelves = new ArrayList<>();

    public Member(String login, String password, String name, String phoneNumber, Address address) {
        this.login = login;
        this.password = password;
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.farmShelves = new ArrayList<>();
    }
    public void addShelf(Shelf shelf) {
        farmShelves.add(shelf);
        shelf.linkMember(this);
    }
}