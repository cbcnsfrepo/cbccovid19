package nsfcovid19.cwru.parsers;
import java.io.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.logging.Logger;

public class Parser extends Utilities {
	private static final Logger LOGGER = Logger.getGlobal();
	
	private static final String pos_prefix = "GenomicPos";
	private static final String snp_prefix = "VariantTotal";
	private static final int sample_start_row = 8;
	private static final int sample_row_length = 13;
	/**
	 * This method gets all base-pairs which variation has occurred.
	 * 
	 * @return The list of all variant base-pairs
	 * 
	 * @throws Exception
	 */
	static void setPosWithSNP(String path) throws Exception {
		LOGGER.info("getting genomic positions");
		List<String> pos_list = new ArrayList<String>();
		try {
			BufferedReader reader = new BufferedReader(new FileReader(path));
			String line;
			while ((line = reader.readLine()) != null) {
				String[] entries = line.split(",");
				List<String> list = Arrays.asList(entries);
				if (list.contains(pos_prefix)) {
					int start = list.indexOf(pos_prefix) + 1;
					for (int i = start; i < list.size(); i++) {
						pos_list.add(list.get(i));
					}
					break;
				}
			}
			LOGGER.info("done reading genomic positions");
			reader.close();
		} catch (IOException e) {
			LOGGER.info("e=" + e);
			throw new RuntimeException();
		}
		if (pos_list.isEmpty()) {
			throw new EmptyArrayException("list is empty");
		}
		LOGGER.info("assigning locations and snps");
		snps = getTotalVariant(path);
		pos = pos_list;
	}

	/**
	 * This method gets number of SNPs that happened at all locations where variation has occurred.
	 * 
	 * @return The list of total number of SNPs
	 * 
	 * @throws Exception
	 */
	static List<Integer> getTotalVariant(String path) throws Exception {
		LOGGER.info("getting position SNP");
		List<Integer> snp_list = new ArrayList<Integer>();
		try {
			BufferedReader reader = new BufferedReader(new FileReader(path));
			String line;
			while ((line = reader.readLine()) != null) {
				String[] entries = line.split(",");
				List<String> list = Arrays.asList(entries);
				if (list.contains(snp_prefix)) {
					int start = list.indexOf(snp_prefix) + 1;
					for (int i = start; i < list.size(); i++) {
						snp_list.add(Integer.parseInt(list.get(i)));
					}
					break;
				}
			}
			LOGGER.info("done reading position SNP");
			reader.close();
		} catch (IOException e) {
			LOGGER.info("e=" + e);
			throw new RuntimeException();
		}
		if (snp_list.isEmpty()) {
			throw new EmptyArrayException("list is empty");
		}
		return snp_list;
	}

	static List<List<String>> getSampleInfos(String path) throws Exception {
		LOGGER.info("getting sample informations");
		List<List<String>> sample_list = new ArrayList<List<String>>();
		try {
			BufferedReader reader = new BufferedReader(new FileReader(path));
			String line;
			int row_index = 0;
			while ((line = reader.readLine()) != null) {
				if (row_index >= sample_start_row) {
					String[] entries = line.split(",");
					List<String> list = Arrays.asList(entries);
					sample_list.add(list.subList(sample_row_length + 1, list.size()));
				}
				row_index++;
			}
			LOGGER.info("read " + (row_index - sample_start_row) + " samples");
			LOGGER.info("done reading sample information");
			reader.close();
		} catch (IOException e) {
			LOGGER.info("e=" + e);
			throw new RuntimeException();
		}
		if (sample_list.isEmpty()) {
			throw new EmptyArrayException("list is empty");
		}
		return sample_list;
	}
}
