package com.example.SmartFarmBackEnd;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class SmartFarmBackEndApplicationTests {

	@Test
	void contextLoads() {
		System.out.println("Hello World");
	}

}
