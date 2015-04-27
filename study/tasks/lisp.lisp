(progn
  
  (output-data 
    (concat
      (get-firstname user1)
      (get-lastname user1)
    )
    (get-status user1)
    (get-level user1)
    (get-privs user1)
    (get-read-priv user1)
  )
  
  (set-privs
    (list
      (get-id user1)
      (string "read")
    )
    (list 
      (get-id user1)
      (string "write")
    )
  )
  
  (check-status
    (if (user-exists? user1)
      (get-id user1)
      (create-id
        (list
          (concat (firstname user1) (lastname user1))
          (generate-id)
        )
      )
    )
  )
  
)