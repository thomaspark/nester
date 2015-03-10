(define (fourth x)
  (* x x x x))

(define (radio-word l)
  (cond ((equal? l 'a) 'alpha)
    ((equal? l 'b) 'bravo)
    ((equal? l 'c) 'charlie)))

(define (repeated-numbers sent)
  (every first
    (keep (lambda (wd) (>= (count wd) 2))
      (sort-digits (accumulate word sent)))))

(define (numlines file)
  (let ((inport (open-input-file file)))
    (define lines (count-lines inport))
    (close-input-port inport)
    lines))