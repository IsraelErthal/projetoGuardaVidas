package com.example.demo.config;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

//Listener ouve eventos da api, facilitando processos ou gerando relatórios
@Component
public class SwaggerStartupListener {

    //Quando a aplicação ficar pronta
    @EventListener(ApplicationReadyEvent.class)
    public void onStart(){
        String blue = "\u001B[34m";
        String reset = "\u001B[0m";
        String bold = "\u001B[1m";

        System.out.println("\n" + blue + "================================================================================" + reset);
        System.out.println(blue + bold + "  Swagger UI is available at: http://localhost:8080/swagger-ui.html" + reset);
        System.out.println(blue + "================================================================================" + reset + "\n");
    }
}
