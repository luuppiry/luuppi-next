-- Update EventRegistration records to populate eventDocumentId from Event table
UPDATE
    "EventRegistration"
SET
    "eventDocumentId" = "Event"."eventDocumentId"
FROM
    "Event"
WHERE
    "EventRegistration"."eventId" = "Event"."eventId"
    AND "Event"."eventDocumentId" IS NOT NULL
    AND "EventRegistration"."eventDocumentId" IS NULL;
