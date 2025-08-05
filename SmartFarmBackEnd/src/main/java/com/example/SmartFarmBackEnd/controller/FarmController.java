package com.example.SmartFarmBackEnd.controller;

import com.example.SmartFarmBackEnd.domain.Member;
import com.example.SmartFarmBackEnd.domain.Pot;
import com.example.SmartFarmBackEnd.domain.Shelf;
import com.example.SmartFarmBackEnd.domain.ShelfFloor;
import com.example.SmartFarmBackEnd.dto.PotDto;
import com.example.SmartFarmBackEnd.dto.PotPositionRequest;
import com.example.SmartFarmBackEnd.service.FarmService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequiredArgsConstructor
public class FarmController {
    private final FarmService farmService;

    private Long getSessionMemberId(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("LOGIN_MEMBER") == null) {
            throw new IllegalStateException("로그인이 필요합니다.");
        }
        return (Long) session.getAttribute("LOGIN_MEMBER");
    }
    @GetMapping("/api/farm/getSeedlings")
    public ResponseEntity<List<PotDto>> getFarmStructure(HttpServletRequest request) {
        Long memberId = getSessionMemberId(request);
        Member member = farmService.selectFarm(memberId);

        ArrayList<PotDto> result = new ArrayList<>();
        for (Shelf shelf : member.getFarmShelves()) {
            for (ShelfFloor floor : shelf.getShelfFloors()) {
                for (Pot pot : floor.getPots()) {
                    result.add(PotDto.from(pot));
                }
            }
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/api/farm/addSeedling")
    public ResponseEntity<Void> addSeedling(@RequestBody PotPositionRequest req,
                                            HttpServletRequest httpRequest) {
        Long memberId = getSessionMemberId(httpRequest);
        farmService.addPot(memberId, req);
        return ResponseEntity.ok().build();
    }
}
