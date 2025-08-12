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
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@CrossOrigin(
        origins = {"http://localhost:3000", "http://10.145.189.17:3000"},
        allowCredentials = "true"
)
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
            shelf.getPosition(); // 🔄 강제 초기화
            for (ShelfFloor floor : shelf.getShelfFloors()) {
                floor.getPosition(); // 🔄 강제 초기화
                for (Pot pot : floor.getPots()) {
                    pot.getPosition(); // 🔄 강제 초기화
                    pot.getShelfFloor().getShelf().getPosition(); // 💥 여기까지 강제로 접근
                    result.add(PotDto.from(pot));
                }
            }
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/api/farm/addSeedling")
    public ResponseEntity<Void> addSeedling(@RequestBody PotPositionRequest req,
                                            HttpServletRequest httpRequest) {
        log.info("📍 Pot 위치 요청 - x: {}, y: {}, shelfFloorId: {}",
                req.getShelfPosition(), req.getFloorPosition(), req.getPotPosition());
        Long memberId = getSessionMemberId(httpRequest);
        farmService.addPot(memberId, req);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/api/farm/deleteSeedling")
    public ResponseEntity<Void> deleteSeedling(@RequestBody PotPositionRequest req,
                                            HttpServletRequest httpRequest) {
        log.info("📍 Pot 위치 삭제 요청 - x: {}, y: {}, shelfFloorId: {}",
                req.getShelfPosition(), req.getFloorPosition(), req.getPotPosition());
        Long memberId = getSessionMemberId(httpRequest);
        farmService.deletePot(memberId, req);
        return ResponseEntity.ok().build();
    }
}
