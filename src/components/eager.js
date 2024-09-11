import {FileAttachment} from "npm:@observablehq/stdlib";
import * as aq from "npm:arquero";

export async function loadEagerTableRaw() {
    const eager = await FileAttachment("../data/eager.zip").zip();
    const eagerTables = await Promise.all(eager.filenames.map(async fn => {
        const batchName = fn.split("/")[6];
        const tab = await eager.file(fn).tsv({ typed: true });
        return tab.map(row => {
            row.batch_name = batchName;
            return row;
        });
    }));
    return eagerTables.reduce((acc, curr) => acc.concat(curr), []);
}

function clean_eager_sample_ss(sample_string) {
    if(sample_string.length == 6)
        return sample_string;
    if(sample_string.substring(6, 9) == "_ss") {
        if(sample_string.length == 9)
            return sample_string.substring(0, 6);
        else {
            return sample_string.substring(0, 6) + sample_string.substring(9);
        }
    }
    else {
        return sample_string;
    }
}

export async function loadEagerTableProcessed() {
    const eagerTableRaw = await loadEagerTableRaw();
    return eagerTableRaw.map(row => ({
        batch_name:                row.batch_name,
        sample:                    row.Sample,
        sample_clean:           clean_eager_sample_ss(row.Sample),
        single_stranded:           row.Sample.substring(6, 9) == "_ss",
        total_reads:               row["Samtools Flagstat (pre-samtools filter)_mqc-generalstats-samtools_flagstat_pre_samtools_filter-flagstat_total"],
        mapped_reads:              row["Samtools Flagstat (pre-samtools filter)_mqc-generalstats-samtools_flagstat_pre_samtools_filter-mapped_passed"],
        mapped_reads_post:         row["Samtools Flagstat (post-samtools filter)_mqc-generalstats-samtools_flagstat_post_samtools_filter-mapped_passed"],
        endog_endorspy:            row["endorSpy_mqc-generalstats-endorspy-endogenous_dna"],
        endog_endorspy_post:       row["endorSpy_mqc-generalstats-endorspy-endogenous_dna_post"],
        mean_coverage:             row["QualiMap_mqc-generalstats-qualimap-mean_coverage"],
        damage_5p1:                row["DamageProfiler_mqc-generalstats-damageprofiler-5_Prime1"],
        damage_5p2:                row["DamageProfiler_mqc-generalstats-damageprofiler-5_Prime2"],
        damage_3p1:                row["DamageProfiler_mqc-generalstats-damageprofiler-3_Prime1"],
        damage_3p2:                row["DamageProfiler_mqc-generalstats-damageprofiler-3_Prime2"],
        mean_read_length:          row["DamageProfiler_mqc-generalstats-damageprofiler-mean_readlength"],
        nr_snps_covered:           row["snp_coverage_mqc-generalstats-snp_coverage-Covered_Snps"],
        contam:                    row["nuclear_contamination_mqc-generalstats-nuclear_contamination-Method1_MOM_estimate"],
        contam_err:                row["nuclear_contamination_mqc-generalstats-nuclear_contamination-Method1_MOM_SE"],
        fastqc_preTrim_total_seq:  row["FastQC (pre-Trimming)_mqc-generalstats-fastqc_pre_trimming-total_sequences"],
        fastqc_postTrim_total_seq: row["FastQC (post-Trimming)_mqc-generalstats-fastqc_post_trimming-total_sequences"],
        percent_duplicates:        row["Picard_mqc-generalstats-picard-PERCENT_DUPLICATION"],
        xrate:                     row["SexDetErrmine_mqc-generalstats-sexdeterrmine-RateX"],
        yrate:                     row["SexDetErrmine_mqc-generalstats-sexdeterrmine-RateY"],
        xrateErr:                  row["SexDetErrmine_mqc-generalstats-sexdeterrmine-RateErrX"],
        yrateErr:                  row["SexDetErrmine_mqc-generalstats-sexdeterrmine-RateErrY"],
    }));
}

export async function loadEagerIndividuals() {
    const eagerProcessed = await loadEagerTableProcessed().then(t => t.filter(row => row.sample_clean.length == 6));
    const eager_ds = aq.from(eagerProcessed).filter(row => !row.single_stranded);
    const eager_ss = aq.from(eagerProcessed).filter(row => row.single_stranded);
    const merged_eager_inds = eager_ds
        .join_full(eager_ss, "sample_clean", null, { suffix: ["_ds", "_ss"] });
    const stranded_lookup_table = merged_eager_inds
        .derive({ stranded : row => {
            if(row.nr_snps_covered_ss != null && row.nr_snps_covered_ds != null) {
                if(row.nr_snps_covered_ds > row.nr_snps_covered_ss) {
                    return "DS*";
                } else {
                    return "SS*";
                }
            }
            else if(row.nr_snps_covered_ds != null) {
                return "DS";
            } else if(row.nr_snps_covered_ss != null) {
                return "SS";
            } else {
                return null;
            }
        }})
        .select(["sample_clean", "stranded"]);
    return merged_eager_inds
        .join_left(stranded_lookup_table, "sample_clean")
        .objects()
        .map(row => {
            const ret_object = {};
            for (const key in row) {
                if(key == "sample_clean" || key == "stranded") {
                    ret_object[key] = row[key];
                }
                if(row.stranded == "SS" || row.stranded == "SS*") {
                    if(key.substring(key.length - 3, key.length) == "_ss") {
                        ret_object[key.substring(0, key.length - 3)] = row[key];
                    }
                }
                else if(row.stranded == "DS" || row.stranded == "DS*") {
                    if(key.substring(key.length - 3, key.length) == "_ds") {
                        ret_object[key.substring(0, key.length - 3)] = row[key];
                    }
                }
            }
            return ret_object;
        });
} 
