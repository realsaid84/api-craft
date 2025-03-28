# Account Domain Model

```mermaid
erDiagram
    ACCOUNT {
        string accountIdentifier "0..*"
        string accountState "0..1"
        string accountType "0..1"
        string currency "0..1"
        string id "1"
        string name "0..1"
        string number "1"
    }
    ACCOUNT ||--o{ ACCOUNTBALANCE : has
    ACCOUNT ||--o{ PARTY : linked_to
    ACCOUNTBALANCE {
        string accountId "1"
        number amount "1"
        date asOfBusinessDate "1"
        date balanceDate "1"****
        string balanceState "0..1"
        string balanceType "1"
        string id "1"
        datetime lastUpdatedDateTime "1"
        string positionType "1"
    }
    PARTY {
        string address "0..*"
        string channel "0..1"
        string contact "0..*"
        string financialInformation "0..1"
        string id "1"
        string partyAlternateIdentifier "0..*"
        string partyIdentifier "0..*"
        string partyName "0..*"
        string partyType "0..1"
        string paymentInstrument "0..1"
        string role "0..1"
        string status "0..1"
        string website "0..1"
        string websiteAvailable "0..1"
    }
    PARTY ||--o{ PARTYACCOUNTROLE : plays
    PARTYACCOUNTROLE {
        string accountId "0..1"
        string partyId "0..1"
        string role "1"
    }
    PARTY ||--o{ PARTYASSIGNEDROLE : assigned
    PARTYASSIGNEDROLE {
        string code "0..1"
        string description "0..1"
        string name "1"
    }
```

