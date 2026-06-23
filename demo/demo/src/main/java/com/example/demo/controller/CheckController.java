package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.dto.CheckinDTO;
import com.example.demo.dto.CheckinResponseDTO;
import com.example.demo.dto.CheckoutDTO;
import com.example.demo.dto.CheckoutResponseDTO;
import com.example.demo.dto.PostoStatusDTO;
import com.example.demo.service.CheckService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/check")
public class CheckController {

    @Autowired
    private CheckService checkService;

    @PostMapping("/in")
    public CheckinResponseDTO checkin(@ModelAttribute @Valid CheckinDTO dto, Authentication authentication){
      validarOperador(authentication);
      return checkService.checkin(dto, authentication.getName());
    }

    @PostMapping("/out")
    public CheckoutResponseDTO checkout(@ModelAttribute @Valid CheckoutDTO dto, Authentication authentication){
      validarOperador(authentication);
      return checkService.checkout(dto, authentication.getName());
    }

    @GetMapping("/status")
    public List<PostoStatusDTO> status(){
      return checkService.statusPostos();
    }

    @GetMapping("/checkins")
    public List<PostoStatusDTO> checkins(){
      return checkService.checkinsHoje();
    }

    @GetMapping("/checkouts")
    public List<PostoStatusDTO> checkouts(){
      return checkService.checkoutsHoje();
    }

    private void validarOperador(Authentication authentication) {
      if (authentication == null) {
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário não autenticado.");
      }

      boolean admin = authentication.getAuthorities().stream()
          .map(GrantedAuthority::getAuthority)
          .anyMatch("ROLE_ADMIN"::equals);

      if (admin) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Administradores não podem realizar check-in ou check-out.");
      }
    }
}
