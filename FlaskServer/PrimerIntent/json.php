<?php
$json = $_POST['start'];

/* sanity check */
if (json_decode($start) != null) {
    $file = fopen('/prueba.py','w+');
    fwrite($file, $start);
    fclose($file);
}
else {
 //
}
?>
