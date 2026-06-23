package com.example.demo;

import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class DemoApplicationTests {


    @Test
    @DisplayName("Deve carregar o contexto da aplicação")
    void contextLoads() {

        assertNotNull(DemoApplication.class);
    }

    @Test
    @DisplayName("Deve executar método main sem erros")
    void main() {

        DemoApplication.main(new String[] {});
    }

}
