package com.example.SmartFarmBackEnd.repository;

import com.example.SmartFarmBackEnd.domain.Address;
import com.example.SmartFarmBackEnd.domain.Member;
import com.example.SmartFarmBackEnd.domain.Pot;
import com.example.SmartFarmBackEnd.domain.Shelf;
import com.example.SmartFarmBackEnd.domain.ShelfFloor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.annotation.Rollback;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import(MemberRepository.class)
class MemberRepositoryTest {

    @Autowired
    private MemberRepository memberRepository;

    @Test
    @DisplayName("findWithShelves should fetch member with shelves, floors, and pots")
    @Rollback(false)
    void testFindWithShelves() {
        // given: create and save a member with nested farmShelves
        Address address = new Address("TestCity", "TestStreet", "12345");
        Member member = new Member("testLogin", "testPass", "Test Name", "010-1234-5678", address);

        // create shelf
        Shelf shelf = new Shelf();
        shelf.setPosition(0);
        member.addShelf(shelf);

        // create floor
        ShelfFloor floor = new ShelfFloor();
        floor.setPosition(0);
        shelf.addFloor(floor);

        // create pot
        Pot pot = new Pot();
        pot.setPosition(0);
        floor.addPot(pot);

        // save the graph
        Long saved = memberRepository.save(member);
        Member savedMember = memberRepository.findById(saved).get();
        Long memberId = savedMember.getId();

        // when: fetch with custom method
        Optional<Member> fetchedOpt = memberRepository.findWithShelves(memberId);

        // then
        assertThat(fetchedOpt).isPresent();
        Member fetched = fetchedOpt.get();
        // shelves
        assertThat(fetched.getFarmShelves()).hasSize(1);
        Shelf fetchedShelf = fetched.getFarmShelves().getFirst();
        assertThat(fetchedShelf.getShelfFloors()).hasSize(1);
        ShelfFloor fetchedFloor = fetchedShelf.getShelfFloors().getFirst();
        assertThat(fetchedFloor.getPots()).hasSize(1);
    }
}