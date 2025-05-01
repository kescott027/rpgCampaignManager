# 📚 Forgesworn Campaign Data Schema Reference

---

## 🧩 ENTITY

> Tracks: People, Places, Groups, and Things in the campaign world.

### ENTITY

- **Entity ID**: *String* — Unique canonical name of the entity.
- **Entity Type**: *Enum* — One of:
  - `GM`
  - `Player`
  - `Player Character`
  - `Non Player Character`
  - `Group`
  - `Place`
  - `Thing`
- **Entity Aliases**: *List[String]* — Alternate names or nicknames.
- **Entity Status**: *List[String]* — Describes the current or past state(s) of the entity.
- **Entity Relationships**: *List[Relationship]* — Key links to other entities.

---

## 🔗 RELATIONSHIP

> Tracks: Multi-entity affiliations, alliances, rivalries, and bonds.

### RELATIONSHIP

- **Relationship ID**: *String* — Unique 20-character random string.
- **Relationship Principal**: *String* — The `Entity ID` this relationship centers on.
- **Relationship Description**: *String (≤100 characters)* — Describes the relationship.
- **Relationship Related Entities**: *List[String]* — Other `Entity ID`s involved.
- **Relationship Tags**: *List[String]* — Includes:
  - Principal
  - Related entities
  - Extracted verbs (e.g. “fled”, “commands”)
  - Standard tag phrases (e.g. `[Fleeing]`, `[Allied with]`)

---

## 📆 EVENT

> Tracks: Time-stamped, narratively or mechanically important actions.

### EVENT

- **Event Timestamp**: *String* — Auto-generated, format: `yyyyMMdd:HH:mm:ss.SSS`
- **Event Description**: *String (≤100 characters)* — Must be in past tense and use `[Entity]` references.
- **Source**: *Enum* — One of `[Campaign]`, `[Novel]`, `[Both]` (default: `[Campaign]`)
- **Book**: *Integer* — Book number (default: 0)
- **Chapter**: *String* — Chapter name (default: `'Unspecified'`)
- **Session**: *String* — Campaign session label
- **Index**: *Integer* — Default 1, auto-incremented to avoid duplicate Event IDs
- **Event ID**: *String* — Generated as:  
  `{Source}:{Book}:{Chapter}:{Session}:{Timestamp}:{Index}`

---

## 🧠 STATUS

> Tracks: The condition of an entity and its evolution through events.

### STATUS

- **Status Event ID**: *String* — Links to triggering `Event ID`
- **Status Principal**: *String* — The `Entity ID` being described
- **Status ID**: *String* — Generated as: `{Status Principal}:{Status Event ID}`
- **Status Related Entities**: *List[String]* — Other `Entity ID`s involved
- **Status Description**: *String (≤100 characters)* — Uses past tense and `[Entity]` format
- **Status Active**: *Boolean* — True if this is the entity's current condition
- **Status Tags**: *List[String]* — Includes:
  - Principal (index 0)
  - Related Entities
  - Key verbs from description
  - Standard tag phrases (e.g., `[Residing in]`, `[Traveling to]`)

---

## 📖 STATUS VERB TAG BANK

> Reference: Converts raw verb phrases to structured semantic tags.

### STATUS VERB TAG BANK (sample mappings)

| Raw Verb / Phrase       | Mapped STATUS Tag     |
|--------------------------|------------------------|
| "resides", "hiding"      | `[Residing in]`        |
| "traveling", "moving"    | `[Traveling to]`       |
| "fled", "escaping"       | `[Fleeing]`            |
| "carries", "transporting"| `[Carrying]`           |
| "commands", "leads"      | `[Commanding]`         |
| "worships", "prays"      | `[Devoted to]`         |
| "captured", "imprisoned" | `[Imprisoned by]`      |
| ... *(extensible)*       |                        |

---

## 🔄 System Interlinks

| Schema       | Linked To                  |
|--------------|----------------------------|
| `ENTITY`     | ↔ `STATUS`, `EVENT`, `RELATIONSHIP` |
| `STATUS`     | ← `EVENT`, ↔ `ENTITY`       |
| `EVENT`      | ↔ `STATUS`, ↔ `ENTITY`      |
| `RELATIONSHIP` | ↔ `ENTITY`               |
