package com.example.SmartFarmBackEnd.repository;

import com.example.SmartFarmBackEnd.domain.Image;
import com.example.SmartFarmBackEnd.domain.Member;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class ImageRepository {
    private final EntityManager em;

    public Image save(Image image) {
        em.persist(image);
        return image;
    }

    public Optional<Image> findById(Long id) {
        return Optional.ofNullable(em.find(Image.class, id));
    }

    public Optional<Image> findByMember(Member member) {
        return em.createQuery("select i from Image i where i.member = :member", Image.class)
                .setParameter("member", member)
                .getResultStream()
                .findFirst();
    }

    public void delete(Image image) {
        em.remove(image);
    }
}