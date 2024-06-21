#!/usr/bin/env bash

rsync -aR --delete daghead1:/mnt/archgen/MICROSCOPE/eager_outputs/*/multiqc/multiqc_data/*general_stats.txt /tmp/eager

cat /tmp/eager/mnt/archgen/MICROSCOPE/eager_outputs/*/multiqc/multiqc_data/*general_stats.txt
