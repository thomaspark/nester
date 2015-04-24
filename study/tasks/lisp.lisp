(defun orc-battle ()
  (init-monsters)
  (init-player)
  (game-loop)
  (when (player-dead)
    (princ "You have been killed. Game Over."))
  (when (monsters-dead)
    (princ "Congratulations! You have vanquished all of your foes.")))

(defun game-loop ()
  (unless (or (player-dead) (monsters-dead))
    (show-player)
    (dotimes (k (1+ (truncate (/ (max 0 *player-agility*) 15))))
      (unless (monsters-dead)
        (show-monsters)
        (player-attack)))
    (fresh-line)
    (map 'list
         (lambda(m)
           (or (monster-dead m) (monster-attack m)))
         *monsters*)
    (game-loop)))

(defun init-player ()
  (setf *player-health* 30)
  (setf *player-agility* 30)
  (setf *player-strength* 30))


<body>
  <table>
    <tr>
      <th>Month</th>
      <th>Savings</th>
    </tr>
    <tr>
      <td>January</td>
      <td>$100</td>
    </tr>
  </table>
  <ul>
    <li>
      <p>Beef</p>
      <p>Pork</p>
    </li>
    <li>Apples</li>
    <li>Carrots</li>
    <li>Eggs</li>
    <li>Milk</li>
  </ul>
  <div class="wrapper">
    <div class="section">
      <div>Links</div>
      <div>
        <p>
          <a href="index.html">Home</a>
          <a href="contact.html">Contact</a>
        </p>
      </div>
    </div>
  </div>
</body>